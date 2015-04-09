import ChangeHandler from './change-handler'

export default message => {
  let changeHandler;
  if (message.type == "connected") {
    console.log('JSPM watching enabled!');
  } else if (message.type == "change") {
    // Make sure SystemJS is fully loaded
    if (!changeHandler && window.System && window.System._loader && window.System._loader.modules) {
      changeHandler = new ChangeHandler(window.System)
    }
    if (changeHandler) changeHandler.fileChanged(message.path)
  } else {
    console.error(`Unknown message type! ${JSON.stringify(message)}`)
  }
}
