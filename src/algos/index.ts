import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as peerMakersPosts from './peer-makers-posts'
import * as peerMakersReplies from './peer-makers-replies'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [peerMakersPosts.shortname]: peerMakersPosts.handler,
  [peerMakersReplies.shortname]: peerMakersReplies.handler,
}

export default algos
