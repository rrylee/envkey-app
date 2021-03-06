import Pusher from 'pusher-js'
import R from 'ramda'
import {store} from 'init_redux'
import {
  socketUserUnsubscribedOrgChannel,
  socketUserUnsubscribedObjectChannel,
  socketUserSubscribedOrgChannel,
  socketUserSubscribedObjectChannel,
  socketAction
} from 'actions'

export const
  UPDATE_ENVS = "UPDATE_ENVS",
  UPDATE_ENVS_STATUS = "UPDATE_ENVS_STATUS",
  ORG_UPDATE = "ORG_UPDATE"

let socket,
    orgChannel,
    orgPresenceChannel,
    orgUserChannel,
    objectChannel,
    objectPresenceChannel

const
  ORG_MESSAGE_TYPES = {
    plainEvents: [ORG_UPDATE],
    clientEvents: []
  },

  OBJECT_MESSAGE_TYPES = {
    plainEvents: [],
    clientEvents: [UPDATE_ENVS_STATUS]
  },

  pusherClient = (auth, orgSlug)=> {
    return new Pusher(process.env.PUSHER_APP_KEY, {
      authEndpoint: `${process.env.API_HOST}/pusher/subscribe.json`,
      auth: {
        headers: R.pick(["access-token", "uid", "client"], auth),
        params: { org_id: orgSlug }
      },
      encrypted: true,
      disableStats: true
    })
  },

  bindChannel = (messageTypes, channel)=>{
    messageTypes.plainEvents.forEach(type => {
      channel.bind(type, data => store.dispatch(socketAction(type, data)))
    })

    messageTypes.clientEvents.forEach(type => {
      channel.bind(("client-" + type), data => store.dispatch(socketAction(type, data)))
    })
  },

  bindPresenceChannel = (eventType, actionCreator, channel)=>{
    channel.bind(eventType, ({id: userId}) => store.dispatch(actionCreator({userId})))
  },

  broadcastToChannel = (channel, userId, messageType, data={})=>{
    if(channel){
      try {
        channel.trigger(("client-" + messageType), {...data, userId})
      } catch (e){
        console.log(e)
      }
    }
  }

let reconnectInterval;

export const

  ensureSocket = (auth, orgSlug)=>{
    socket = pusherClient(auth, orgSlug)

    socket.connection.bind('disconnected', ()=>{
      socket = null
      ensureSocket(auth, orgSlug)
    })

    if(reconnectInterval)clearInterval(reconnectInterval)
    reconnectInterval = setInterval(()=>{
      if (!["connecting", "connected"].includes(socket.connection.state)){
        socket = null
        ensureSocket(auth, orgSlug)
      }
    }, 5000)
  },

  unsubscribeOrgChannels = ()=>{
    if(orgChannel)socket.unsubscribe(orgChannel.name)
    // if(orgUserChannel)socket.unsubscribe(orgUserChannel.name)
    if(orgPresenceChannel)socket.unsubscribe(orgPresenceChannel.name)
  },

  subscribeOrgChannels = (org, currentUser)=> {
    orgChannel = socket.subscribe(org.broadcastChannel)
    orgPresenceChannel = socket.subscribe(org.broadcastChannel.replace(/^private-/, "presence-"))
    // orgUserChannel = socket.subscribe(currentUser.broadcastChannel)
    bindChannel(ORG_MESSAGE_TYPES, orgChannel)
    bindPresenceChannel('pusher:member_removed', socketUserUnsubscribedOrgChannel, orgPresenceChannel)
    bindPresenceChannel('pusher:member_added', socketUserSubscribedOrgChannel, orgPresenceChannel)
  },

  broadcastOrgChannel = (userId, messageType, data)=>{
    broadcastToChannel(orgChannel, userId, messageType, data)
  },

  unsubscribeObjectChannel = ()=>{
    if(objectChannel)socket.unsubscribe(objectChannel.name)
    if(objectPresenceChannel)socket.unsubscribe(objectPresenceChannel.name)
  },

  subscribeObjectChannel = object => {
    objectChannel = socket.subscribe(object.broadcastChannel)
    objectPresenceChannel = socket.subscribe(object.broadcastChannel.replace(/^private-/, "presence-"))
    bindChannel(OBJECT_MESSAGE_TYPES, objectChannel)
    bindPresenceChannel('pusher:member_removed', socketUserUnsubscribedObjectChannel, objectPresenceChannel)
    bindPresenceChannel('pusher:member_added', socketUserSubscribedObjectChannel, objectPresenceChannel)
  },

  broadcastObjectChannel = (userId, messageType, data)=>{
    broadcastToChannel(objectChannel, userId, messageType, data)
  }
