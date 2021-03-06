import React from 'react'

import h from "lib/ui/hyperscript_with_helpers"
import {imagePath} from "lib/ui"

export default function({parent, environments}) {

  const
    renderEnvLabel = (environment, i)=> {
      const locked = parent.role == "development" && environment == "production"
      return h.div(".label-cell", {
        key: i,
        className: `env-${environment} ${locked ? 'locked' : ''}`
      }, [
        h.label([
          locked ? h.img(".img-locked", {src: imagePath("padlock.svg")}) : "",
          environment
        ])
      ])
    },

    renderTitle = ()=> h.div(".label-cell.title-cell", {key: "title"}, [
      h.label([
        h.img({src: imagePath("menu-lightning-white.svg")}),
        parent.name
      ])
    ])

  return h.div(".row.label-row",
    [h.div(".cols", [renderTitle()].concat(environments.map(renderEnvLabel)))]
  )
}