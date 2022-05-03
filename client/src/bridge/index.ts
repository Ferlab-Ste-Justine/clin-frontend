import { StoreType } from 'store';

type CallBackType = (e: MessageEvent) => void;

/*
  This class bridges with an iframe to receive messages
  It could be extended to support bidirectional communication
  It only support receiving message event at this time

  e.g.
    const bridge = new Bridge(store, iFrame.current);
    bridge.register('createNewPrescription', prescriptionModalCallback);

  Registered event must be remove to prevent memory leak

  e.g. with react effect
    ...
    let bridge: Bridge;
    useEffect(() => {
        ...
        return function cleanup() {
          if (bridge) {
            bridge.remove(yourCallBack);
          }
        };
      }, [iFrame])
*/

let clinUIChannel: HTMLIFrameElement;
export class Bridge {
  private store: StoreType;
  private channel: HTMLIFrameElement;

  constructor(store: StoreType, ref: HTMLIFrameElement) {
    this.store = store;
    this.channel = ref;
  }

  register(action: string, callback: CallBackType): void {
    this.channel.contentWindow?.parent.addEventListener('message', (e): void => {
      if (e.origin !== window.origin || action !== e.data.action) {
        return;
      }
      callback(e);
    });
  }

  remove(callback: CallBackType): void {
    this.channel.contentWindow?.removeEventListener('message', callback, false);
  }

  static setMainChannel(ref: HTMLIFrameElement): void {
    clinUIChannel = ref;
  }

  static broadcastMessage(msg: string): void  {
    clinUIChannel?.contentWindow?.postMessage(msg, window.origin);
  }
}
