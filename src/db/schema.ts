export type DatabaseSchema = {
  post: Post
  sub_state: SubState
}

export type Post = {
  uri: string
  cid: string
  indexedAt: string
  isReply: number
}

export type SubState = {
  service: string
  cursor: number
}
