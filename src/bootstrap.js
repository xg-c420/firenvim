// Thunderbird entry point for legacy process.

let { ExtensionSupport } = ChromeUtils.import(
  "resource:///modules/ExtensionSupport.jsm"
);

function install() {
  console.log("install", this);
}

function uninstall() {
  console.log("uninstall", this);
}

function startup(data, reason) {
  console.log("startup", data, reason, this);
  ExtensionSupport.registerWindowListener(data.id, {
    chromeURLs: ["chrome://messenger/content/messengercompose/messengercompose.xul",
                 "chrome://messenger/content/messengercompose/messengercompose.xhtml"],
    onLoadWindow: setupUI,
    onUnloadWindow: tearDownUI,
  });
}

function shutdown(data, reason) {
  console.log("shutdown", data, reason, this);
  ExtensionSupport.unregisterWindowListener(data.id);
}

function tearDownUI(domWindow) {
  console.log("tearDownUi", domWindow, this);
}

function setupUI(domWindow) {
  console.log("setupUI", domWindow, this);
  const xul = domWindow.MozXULElement.parseXULToFragment(`
      <iframe
        id="FirenvimFrame"
        data-preview="true"
        flex="1"
        src="chrome://./NeovimFrame.html"
        />
  `);
  const appContent = domWindow.document.getElementById("appcontent");
  const contentFrame = domWindow.document.getElementById("content-frame");
  appContent.insertBefore(xul, contentFrame);
}
