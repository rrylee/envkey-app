import React from 'react'
import zxcvbn from 'zxcvbn'

export default class PasswordInput extends React.Component {

  val(){
    return this.refs.input.value
  }

  focus(){
    this.refs.input.focus()
  }

  _onChange(e){
    const val = e.target.value
    this.setState({value: val})

    if(!this.props.validateStrength){
      if(this.props.onChange)this.props.onChange(val, val.length >= 10)
      return
    }

    if (val.length < 10){
      if(this.props.onChange)this.props.onChange(val, false)
      return
    }

    const {score, feedback} = zxcvbn(val.substr(0,25), [...this.props.strengthUserInputs, "envkey", "passphrase"])

    if(this.props.onChange)this.props.onChange(val, score > 3, score, feedback)
  }


  render(){
    return <div className="password-input">

        <input  value={this.props.value}
                onChange={::this._onChange}
                disabled={this.props.disabled}
                ref="input"
                type="password"
                placeholder={this.props.placeholder || "Your master encryption passphrase (10-256 characters)"}
                pattern=".{10,256}"
                required />

        {this._renderStrength()}
    </div>
  }

  _renderStrength(){
    if (!this.props.disabled && this.props.validateStrength && this.props.value.length >= 10){
      const {score, feedback: {suggestions, warning}} = this.props

      const type = ["horrendously weak", "fairly weak", "weak", "mediocre", "strong"][score]

      let msg = "Seems like a " + type + " passphrase."

      if (warning){
        msg += " " + warning + "."
      }

      if (suggestions && suggestions.length){
        msg += " " + suggestions.join(" ")
      }

      return <span className={`password-strength score-${score}`}>{msg}</span>
    }
  }
}

