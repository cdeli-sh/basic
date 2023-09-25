import { player } from '../main'

export function registerPlayerEvents() { 
  player.on('subscribe', () => {
    console.log(`Subscribed to channel`);	
  })
  
  player.on('unsubscribe', () => {
    console.log(`Unsubscribed to channel`);	
  })
}
