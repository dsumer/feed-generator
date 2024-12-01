import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

import { AtpAgent } from '@atproto/api'

export const agent = new AtpAgent({
  // App View URL
  service: 'https://api.bsky.app',
  // If you were making an authenticated client, you would
  // use the PDS URL here instead - the main one is bsky.social
  // service: "https://bsky.social",
})

/* can be used to get the list of lists for a user (Dominik's did is hardcoded here atm)
agent.app.bsky.graph
  .getLists({
    actor: 'did:plc:hpe2ujguggs2yxistjmudxf7',
  })
  .then((res) => {
    console.log(res.data.lists)
  })*/

const peerMakersListDid =
  'at://did:plc:hpe2ujguggs2yxistjmudxf7/app.bsky.graph.list/3lbpmxkxngr2b'
let peers: string[] = []
function updatePeers() {
  agent.app.bsky.graph
    .getList({
      list: peerMakersListDid,
    })
    .then((res) => {
      peers = res.data.items.map((item) => item.subject.did)
    })
    .catch((err) => {
      console.error(err)
    })
}
updatePeers()
setInterval(updatePeers, 1000 * 60 * 10) // update every 10 minutes

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return

    const ops = await getOpsByType(evt)

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        const isPeerMaker = peers.includes(create.author)
        return isPeerMaker
      })
      .map((create) => {
        const isReply = create.record.reply !== undefined
        return {
          uri: create.uri,
          cid: create.cid,
          isReply,
          indexedAt: new Date().toISOString(),
        }
      })

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
