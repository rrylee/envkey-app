import R from 'ramda'
import {
  IMPORT_ALL_ENVIRONMENTS,
  IMPORT_ENVIRONMENT,
  IMPORT_ENVIRONMENT_FAILED,
  COMMIT_IMPORT_ACTIONS,
  CREATE_ENTRY,
  UPDATE_ENTRY_VAL,
  LOGOUT,
  SELECT_ORG,
  LOAD_INVITE_REQUEST,
  LOGIN,
  LOGIN_REQUEST,
  REGISTER
} from "actions"

export const

  importActionsPending = (state={}, action)=>{
    switch(action.type){

      case CREATE_ENTRY:
      case UPDATE_ENTRY_VAL:
        if (action.meta.importAction){
          return R.mergeWith(R.concat, state, {[action.meta.parentId]: [action]})
        } else {
          return state
        }

      case COMMIT_IMPORT_ACTIONS:
        return R.dissoc(action.meta.parentId, state)

      case LOGOUT:
      case SELECT_ORG:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOAD_INVITE_REQUEST:
        return {}

      default:
        return state
    }
  },

  didOnboardImport = (state={}, action)=>{
    switch(action.type){
      case IMPORT_ALL_ENVIRONMENTS:
        return R.assoc(action.meta.parentId, true, state)

      case LOGOUT:
      case SELECT_ORG:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOAD_INVITE_REQUEST:
        return {}

      default:
        return state
    }
  },

  importErrors = (state={}, action)=>{
    switch(action.type){
      case IMPORT_ENVIRONMENT_FAILED:
        return R.assocPath([action.meta.parentId, action.meta.environment], action.payload, state)

      case IMPORT_ENVIRONMENT:
        return R.pipe(
          R.dissocPath([action.meta.parentId, action.payload.environment]),
          R.reject(R.isEmpty)
        )(state)

      case IMPORT_ALL_ENVIRONMENTS:
        return R.dissoc(action.meta.parentId, state)

      case LOGOUT:
      case SELECT_ORG:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOAD_INVITE_REQUEST:
        return {}

      default:
        return state
    }
  }