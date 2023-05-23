import config from 'config'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'

import removeFile from './utils/remove-file.js'
import OggConverter from './OggConverter.js'


const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
const ogg = new OggConverter()


bot.on(message('text'), async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message, null, 2))
})

bot.on(message('voice'), async (ctx) => {
    try {
        await ctx.reply(code('Сообщение принял. Жду ответ от сервера...'))

        await ctx.reply(JSON.stringify(ctx.message, null, 2))

        const {
            file_id: fileId,
            file_unique_id: fileUniqueId,
        } = ctx.message.voice

        const link = await ctx.telegram.getFileLink(fileId)
        const oggPath = await ogg.create(link.href, fileUniqueId)
        const mp3Path = await ogg.toMp3(oggPath, fileUniqueId)

        removeFile(oggPath)

        console.log(mp3Path)
    } catch (e) {
        console.log(`Error while voice message`, e.message)
    }
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

bot.launch()
