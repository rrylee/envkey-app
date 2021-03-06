import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import EditableValCell from './editable_val_cell'
import Removable from './traits/removable'
import Autocompletable from './traits/autocompletable'
import CopyableCell from './traits/copyable_cell'
import CommitPromptable from './traits/commit_promptable'
import SocketEditable from './traits/socket_editable'

const EnvValCellBaseClass = R.pipe(
  CopyableCell,
  Removable,
  Autocompletable,
  CommitPromptable,
  SocketEditable
)(EditableValCell)

export default class EnvValCell extends EnvValCellBaseClass {
  _commit(update){
    this.props.onCommitEntryVal(
      this.props.entryKey,
      this.props.environment,
      (update || {val: this.state.inputVal})
    )
  }
}