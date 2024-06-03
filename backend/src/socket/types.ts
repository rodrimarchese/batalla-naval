export enum SendMessageType {
  GameSetUp = 'gameSetUp',
}


export type ApprovedGame = {
  hostId: String,
  hostName: String,
  guestId: String,
  guestName: String,
  gameId: String
}

export type MessageSend = {
   userId : string,
   type: SendMessageType,
   message: string
}