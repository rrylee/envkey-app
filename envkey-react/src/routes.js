import React from 'react'
import R from 'ramda'
import { Router, Route, IndexRoute, IndexRedirect } from 'react-router'
import { Provider } from 'react-redux'
import { routerActions, replace } from 'react-router-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import {history, store} from 'init_redux'
import {
  getAuth,
  getCurrentOrgSlug,
  getOrgs,
  getPermissions,
  getApps,
  getDisconnected
} from 'selectors'
import {
  MainContainer,
  SelectOrgContainer,
  SelectedObjectContainerFactory,
  EnvManagerContainerFactory,
  AssocManagerContainerFactory,
  ObjectFormContainerFactory,
  SettingsFormContainerFactory,
  AcceptInviteContainer,
  KeyManagerContainer,
  OnboardOverlayContainer,
  AppCollaboratorsContainer,
  LoginRegisterContainer,
  InviteFailedContainer,
  BillingContainer,
  HomeMenuContainer,
  RequiresConnection,
  DemoLoginContainer
} from 'containers'
import {OnboardAppForm, OnboardAppImporter} from 'components/onboard'

const
  UserAuthenticated = UserAuthWrapper({
    authSelector: getAuth,
    failureRedirectPath: "/home",
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'UserAuthenticated'
  }),

  OrgsLoaded = UserAuthWrapper({
    authSelector: getOrgs,
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'OrgsLoaded'
  }),

  OrgSelected = UserAuthWrapper({
    authSelector: getCurrentOrgSlug,
    failureRedirectPath: "/select_org",
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'OrgSelected'
  })

export default class Routes extends React.Component {

  _redirectIndex(){
    const orgSlug = getCurrentOrgSlug(store.getState())
    if (orgSlug){
      store.dispatch(replace(`/${orgSlug}`))
    } else {
      store.dispatch(replace("/home"))
    }
  }

  _redirectOrgIndex(){
    const state = store.getState(),
          orgSlug = getCurrentOrgSlug(state),
          permissions = getPermissions(state),
          apps = getApps(state)

    if (apps.length){
      const {slug} = apps[0]
      store.dispatch(replace(`/${orgSlug}/apps/${slug}`))
    } else if (permissions.create.app){
      store.dispatch(replace(`/${orgSlug}/apps/new`))
    }
  }

  render(){

    return <Provider store={store}>
      <Router history={history}>

        <Route path="/" onEnter={::this._redirectIndex} />

        <Route path="/home" component={RequiresConnection(HomeMenuContainer)} />

        <Route path="/login" component={RequiresConnection(LoginRegisterContainer)} />

        <Route path="/demo/:bs64props" component={RequiresConnection(DemoLoginContainer)} />

        <Route path="/accept_invite" component={RequiresConnection(AcceptInviteContainer)} />

        <Route path="/invite_failed" component={RequiresConnection(InviteFailedContainer)} />

        <Route path="/select_org" component={RequiresConnection(OrgsLoaded(UserAuthenticated(SelectOrgContainer)))} />

        <Route path="/:orgSlug" component={RequiresConnection(OrgSelected(UserAuthenticated(MainContainer)))}>

          <IndexRoute />

          <Route path="onboard" component={OnboardOverlayContainer} >

            <IndexRedirect to="1" />

            <Route path="1" component={OnboardAppForm} />

            <Route path="2" component={OnboardAppImporter} />

          </Route>

          <Route path="apps/new" component={ObjectFormContainerFactory({objectType: "app"})} />

          <Route path="apps/:slug" component={SelectedObjectContainerFactory({objectType: "app"})} >

            <IndexRedirect to="variables" />

            <Route path="variables" component={EnvManagerContainerFactory({parentType: "app"})} />

            <Route path="keys" component={KeyManagerContainer} />

            <Route path="collaborators" component={AppCollaboratorsContainer} />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "app"})}/>

          </Route>

          <Route path="users/new" component={ObjectFormContainerFactory({objectType: "user"})} />

          <Route path="users/:slug" component={SelectedObjectContainerFactory({objectType: "user", objectPermissionPath: ["orgUser", "permissions"]})} >

            <IndexRedirect to="apps" />

            <Route path="apps" component={AssocManagerContainerFactory({parentType: "user", assocType: "app", joinType: "appUser", isManyToMany: true})} />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "user", targetObjectType: "orgUser", targetObjectPath: ["orgUser"]})}/>

          </Route>

          <Route path="my_org" component={SelectedObjectContainerFactory({objectType: "currentOrg"})} >

            <IndexRedirect to="settings" />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "currentOrg", targetObjectType: "org"})}/>

            <Route path="billing" component={BillingContainer}/>

          </Route>

          <Route path="my_account" component={SelectedObjectContainerFactory({objectType: "currentUser"})} >

            <IndexRedirect to="settings" />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "currentUser", targetObjectType: "user"})}/>

          </Route>

        </Route>

      </Router>
    </Provider>
  }
}
