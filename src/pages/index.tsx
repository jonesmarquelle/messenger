import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import { Oxanium } from '@next/font/google';
import { useEffect, useRef, useState } from "react";

import type { Group, Message, User } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Sidebar, { SidebarGroup } from "../components/Sidebar";
import ChatView from "../components/ChatView";
import CreateGroupForm from "../components/CreateGroupForm";
import GroupMemberForm from "../components/GroupMemberForm";
import CreateGroupCTA from "../components/CreateGroupCTA";
import { useUser } from "../hooks/userHooks";
import { getMessagesByGroup, GroupAndMembers, MessageWithSender } from "../server/db/queries";
import { useMessages } from "../hooks/messagesHook";
import { useGroups, useMembers } from "../hooks/groupsHook";

const oxanium = Oxanium({subsets: ['latin']});

export enum DBGroupAction {
  create = "create",
  addMember = "addMember",
  removeMember = "removeMember"
}

export enum DBMessageAction {
  create = "createMessage"
}

const Home: NextPage<{signin: string}> = ({signin}) => {
  const [currentGroup, setCurrentGroup] = useState<GroupAndMembers>();

  const {user: currentUser, isLoading: userLoading, isError: userError} = useUser(signin);
  const {groups: allGroups, refreshGroups, isError: groupsError, isLoading: groupsLoading} = useGroups(signin);
  const {messages, refreshMessages, isError: messagesError} = useMessages(currentGroup?.id);

  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [showChatView, setShowChatView] = useState<boolean>(true);
  const [showCreateGroupForm, setShowCreateGroupForm] = useState<boolean>(false);

  const openCreateGroupForm = () => {
    setShowChatView(false);
    setShowCreateGroupForm(true);
  }
  const closeCreateGroupForm = () => {
    setShowCreateGroupForm(false);
    setShowChatView(true);
  }

  const openAddMemberForm = () => {
    setShowChatView(false);
    setShowAddMember(true);
  }
  const closeAddMemberForm = () => {
    setShowAddMember(false);
    setShowChatView(true);
  }

  const textAreaRef = useRef<HTMLDivElement>(null);
  const chatViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatViewRef.current?.scrollTo(0, chatViewRef.current.scrollHeight);
  })

  const onMemberRemoved = async () => {
    setCurrentGroup(undefined);
    await refreshGroups();
    closeAddMemberForm()
  }

  const onGroupCreated = async (groupId: number) => {
    await refreshGroups();
    onClickGroup(groupId);
  }

  const onClickGroup = (groupId: number) => {
    const clickedGroup = allGroups.find((g: SidebarGroup) => {return g.id == groupId})
    setCurrentGroup(clickedGroup);
    refreshMessages();

    setShowAddMember(false);
    setShowCreateGroupForm(false);
    setShowChatView(true);
  };

  const onClickSend = () => {
    const message = textAreaRef.current?.innerText;
    if (!message || !currentGroup || !currentUser) return;
    sendMessage(message.trim(), currentUser.id, currentGroup.id);
    textAreaRef.current.innerText = '';
  };

  const sendMessage = async (message: string, userId: string, groupId: number) => {
    if (!currentGroup) return;
    const request = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: DBMessageAction.create, message, groupId, userId
      })
    };
    const newMessage = await fetch(`/api/messages?groupId=${groupId}`, request);
    if (!newMessage.ok) {
      console.error("Message failed to send");
      return;
    }
    const messageSent = await newMessage.json();
    const m: MessageWithSender = {...messageSent}
    m.sender = currentUser;
    refreshMessages();
    refreshGroups();
    //setMessages(messages.concat(m));
  };

  if (userLoading || groupsLoading) {
    return <div>Loading</div>
  } else if (userError || groupsError) {
    console.error("User not fetched")
    return <div>Error</div>
  } else

  return (
    <>
      <Head>
        <title>Vitesi</title>
        <meta name="description" content="Messaging App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`flex flex-row h-screen w-screen bg-black p-1 ${oxanium.className}`}>
        <Sidebar 
          userName={currentUser.name} 
          userImageUrl={currentUser.image} 
          groups={allGroups} 
          clickGroupFn={onClickGroup} 
          createGroupFn={openCreateGroupForm}
        />
        { currentGroup && showChatView && messages ? 
          <ChatView 
            chatViewRef={chatViewRef} 
            textBoxRef={textAreaRef} 
            groupName={currentGroup?.name} 
            messages={messages} 
            currentUserId={currentUser.id} 
            sendMessageFn={onClickSend} 
            addMemberFn={openAddMemberForm}
          />
          : undefined 
        }
          
        { currentGroup === undefined && showChatView ?
          <CreateGroupCTA showFormFn={openCreateGroupForm}/>
          : undefined
        }

        { showCreateGroupForm ? 
          <CreateGroupForm userId={currentUser.id} closeFn={closeCreateGroupForm} createGroupCallback={onGroupCreated} />
          : undefined
        }

        { showAddMember && currentGroup ? 
          <GroupMemberForm groupId={currentGroup.id} userId={currentUser.id} closeFn={closeAddMemberForm} addMemberCallback={() => {return}} removeMemberCallback={onMemberRemoved} />
          : undefined 
        }

      </main>
    </>
  );
};

const getUserWithGroups = async (prisma: PrismaClient, id: string) => {
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: { groups: { include: { members: true } } }
  });

  return user;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      }
    }
  }
  return { props: { signin: session.user!.id } };
}

export default Home;