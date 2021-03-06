import { put, select } from 'redux-saga/effects'
import { replace } from 'react-router-redux'
import {
  getCurrentRoute,
  getCurrentOrgSlug,
  getAppsSortedByUpdatedAt,
  getPermissions
} from 'selectors'

export function *redirectFromOrgIndexIfNeeded(){
  const currentRoute = yield select(getCurrentRoute),
        orgSlug = yield select(getCurrentOrgSlug),
        isOrgIndex = currentRoute.pathname == `/${orgSlug}`

  if (isOrgIndex){
    const apps = yield select(getAppsSortedByUpdatedAt),
          permissions = yield select(getPermissions)

    if (apps.length){
      yield put(replace(`/${orgSlug}/apps/${apps[0].slug}`))
    } else if (permissions.create.app){
      yield put(replace(`/${orgSlug}/onboard`))
    }
  }
}
