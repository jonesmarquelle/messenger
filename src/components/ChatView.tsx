import { MessageWithSender } from "../server/db/queries";
import PersonIcon from "./PersonIcon";
import SendIcon from "./SendIcon";

interface ChatViewProps {
    chatViewRef: React.RefObject<HTMLDivElement>
    textBoxRef: React.RefObject<HTMLDivElement>
    groupName: string
    messages: MessageWithSender[]
    currentUserId: string
    sendMessageFn: () => void
    addMemberFn: () => void
}

const ChatView: React.FC<ChatViewProps> = (props) => {
    const onKeyPressed = (e: React.KeyboardEvent) => {
      if (e.shiftKey) return;
      if (e.key === "Enter") {
        e.preventDefault;
        props.sendMessageFn();
      }
    }
    return (
        <>
        <div className="flex flex-col w-full h-full items-center gap-6">
        <h2 className="flex w-1/2 text-ellipsis text-center justify-center m-5 bg-black border-white border-[1px] text-2xl text-white tracking-widest">
            {props.groupName}
        </h2>
        {props.messages ? (
            <div ref={props.chatViewRef} className="flex flex-col h-full overflow-y-auto w-full p-4 gap-1 scrollbar">
              {(props.messages).map((message, idx) =>
                <div key={message.messageId} className={`${message.userId == props.currentUserId ? "ml-auto" : "mr-auto"}`}>
                  {(idx == props.messages.length || message.userId != props.messages[idx - 1]?.userId) ? (
                    <h6 className={`w-full text-md mt-6 text-neutral-600 ${message.userId == props.currentUserId ? "text-end" : "text-start"}`}>
                      {message.sender.name}
                    </h6>
                  ) : undefined}
                  <p className={`${message.userId == props.currentUserId ? "ml-auto" : "mr-auto"} max-w-[60vw] lg:max-w-[50vw] w-fit p-2 text-lg text-white rounded-md border-[1px] whitespace-pre-wrap`}>
                    {message.message} 
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full"></div>
          )
          }
          {/** Text Input Bar */}
          <div
            className="flex flex-row w-full h-fit min-h-12 mt-2 px-4 pb-4 gap-4">
                {/** Add Member Button */}
                <button onClick={props.addMemberFn} className="w-14 aspect-square mt-auto p-2 border-[1px] fill-white bg-black hover:fill-black hover:bg-white transition-colors duration-200">
                  <PersonIcon height={"100%"} width={"100%"} />
                </button>
                {/** Text Area */}
                <div 
                  onKeyDown={onKeyPressed}
                  className="flex w-full min-h-[2rem] max-h-[6rem] items-center break-words overflow-x-hidden overflow-y-auto scrollbar resize-none bg-black border-[1px] text-white p-2"
                  ref={props.textBoxRef}
                  id="textMessage" contentEditable 
                />
                {/** Send Button */}
                <button onClick={props.sendMessageFn} className="w-14 aspect-square mt-auto border-[1px] p-2 pl-3 fill-white bg-black hover:fill-black hover:bg-white transition-colors duration-200">
                  <SendIcon/>
                </button>
          </div>
          </div>
          </>
    )
}

export default ChatView;