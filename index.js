const { Plugin } = require("powercord/entities");
const { findInReactTree } = require("powercord/util");
const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");

module.exports = class DuckDuckGoSearch extends Plugin {
  async startPlugin() {
    const Menu = await getModule(["MenuItem"]);
    const { MenuItem, MenuGroup } = Menu;

    const MessageContextMenu = await getModule(
      (m) => m.default && m.default.displayName === "MessageContextMenu"
    );

    inject(
      "logge-qwant-search",
      MessageContextMenu,
      "default",
       (args, res) => {
        res.props.children = res.props.children.filter(
          (v) => v.props.children?.[0]?.props?.id != "search-google"
        );

        if (
          !findInReactTree(
            res,
            (c) => c.props && c.props.id === "logge-qwant-search"
          ) &&
          args[0].target.tagName.toLowerCase() == "div" &&
          args[0].target.classList.contains("markup-2BOw-j") &&
          args[0].target.classList.contains("messageContent-2qWWxC")
        ) {
          res.props.children.splice(
            1,
            0,
            React.createElement(
              MenuGroup,
              null,
              React.createElement(MenuItem, {
                action: () => {
                  let markedText = window.getSelection().toString();
                  if (!markedText) {
                    markedText = args[0].message.content;
                  }

                  require("electron").shell.openExternal(
                    `https://www.qwant.com/?q=${encodeURIComponent(markedText)}`
                  );
                },
                id: "logge-qwant-search",
                label: "Search with Qwant",
              })
            )
          );
        }

        return res;
      }
    );

    MessageContextMenu.default.displayName = "MessageContextMenu";

    powercord.api.commands.registerCommand({
      command: "qwant",
      description: "Sends a Qwant link.",
      usage: "{c} [ ...arguments ]",
      executor: (args) => ({
        send: true,
        result: "https://www.qwant.com/?q=" + encodeURIComponent(args.join(" ")),
      }),
    });
  }

  pluginWillUnload() {
    uninject("logge-qwant-search");

    powercord.api.commands.unregisterCommand("qwant");
  }
};

// Inspired by With Mask and Juby210
//Logge gay btw
//Shamelessly modified and reposted from powercord-duckduckgo plugin of LoggeL, just because i wanted to use Qwant instead.
