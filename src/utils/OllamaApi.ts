import { ChatOllama } from '@langchain/community/chat_models/ollama'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
  type MessageContentImageUrl,
} from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import _ from 'lodash'

import { IMessageModel } from '~/models/MessageModel'
import { DefaultHost, settingStore } from '~/models/SettingStore'
import { personaStore } from '~/models/PersonaStore'

import CachedStorage from '~/utils/CachedStorage'

const createHumanMessage = async (message: IMessageModel): Promise<HumanMessage> => {
  if (!_.isEmpty(message.imageUrls)) {
    const imageUrls: MessageContentImageUrl[] = []

    for (const cachedImageUrl of message.imageUrls) {
      const imageData = await CachedStorage.get(cachedImageUrl)

      if (imageData) {
        imageUrls.push({
          type: 'image_url',
          image_url: imageData,
        })
      }
    }

    return new HumanMessage({
      content: [
        {
          type: 'text',
          text: message.content,
        },
        ...imageUrls,
      ],
    })
  }

  return new HumanMessage(message.content)
}

const getMessages = async (chatMessages: IMessageModel[], incomingMessage: IMessageModel) => {
  const messages: BaseMessage[] = []

  const selectedPersona = personaStore.selectedPersona

  if (selectedPersona) {
    messages.push(new SystemMessage(selectedPersona.description))
  }

  for (const message of chatMessages) {
    if (message.uniqId === incomingMessage.uniqId) break

    const selectedVariation = message.selectedVariation

    if (message.fromBot) {
      messages.push(new AIMessage(selectedVariation.content))
    } else {
      messages.push(await createHumanMessage(selectedVariation))
    }
  }

  return messages
}

export class OllmaApi {
  private static abortControllerById: Record<string, AbortController> = {}

  static async *streamChat(
    chatMessages: IMessageModel[],
    incomingMessage: IMessageModel,
    incomingMessageVariant: IMessageModel,
  ) {
    const model = settingStore.selectedModel?.name
    if (!model) return

    const host = settingStore.host || DefaultHost

    const abortController = new AbortController()

    OllmaApi.abortControllerById[incomingMessageVariant.uniqId] = abortController

    const messages = await getMessages(chatMessages, incomingMessage)

    const chatOllama = new ChatOllama({
      baseUrl: host,
      model,
      keepAlive: settingStore.keepAliveTime + 'm',
      temperature: settingStore.temperature,
      callbacks: [
        {
          handleLLMEnd(output) {
            const generationInfo: Record<string, unknown> =
              _.get(output, 'generations[0][0].generationInfo') || {}

            if (!_.isEmpty(generationInfo)) {
              incomingMessageVariant.setExtraDetails(generationInfo)
            }
          },
        },
      ],
      // verbose: true,
    }).bind({ signal: abortController.signal })

    const stream = await ChatPromptTemplate.fromMessages(messages)
      .pipe(chatOllama)
      .pipe(new StringOutputParser())
      .stream({})

    for await (const chunk of stream) {
      yield chunk
    }

    delete OllmaApi.abortControllerById[incomingMessage.uniqId]
  }

  static cancelStream(id?: string) {
    if (id) {
      if (!OllmaApi.abortControllerById[id]) return

      OllmaApi.abortControllerById[id].abort('Stream ended manually')

      delete OllmaApi.abortControllerById[id]
    } else {
      for (const id in OllmaApi.abortControllerById) {
        OllmaApi.abortControllerById[id].abort('Stream ended manually')
      }

      OllmaApi.abortControllerById = {}
    }
  }
}
