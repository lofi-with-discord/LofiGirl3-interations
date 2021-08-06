import { Locale } from '../types'
import PlayerClient from '../structures/PlayerClient'
import { ApplicationCommandData, CommandInteraction, GuildMember, MessageButton } from 'discord.js'

export default async function LeaveCommand (interaction: CommandInteraction, _: any, __: any, locale: Locale, player: PlayerClient) {
  const member = interaction.member as GuildMember
  const meAt = interaction.guild?.me?.voice?.channel
  const userAt = member.voice.channel

  if (!meAt || meAt.type !== 'GUILD_VOICE') return interaction.reply({ content: locale('leave_no_voice'), ephemeral: true })

  const movePerm = member.permissionsIn(meAt).has('MOVE_MEMBERS')
  const membersIn = meAt.members.filter((m) => !m.user.bot && m.id !== member.id).size
  const userIn = (!userAt || meAt.id !== userAt.id) ? 1 : 2

  if (membersIn < 1) {
    await player.stop(meAt)
    interaction.reply(locale('leave_success'))
    return
  }

  if (!movePerm) return interaction.reply({ content: locale('leave_force_fail_' + userIn, meAt.name), ephemeral: true })

  const forceBtn = new MessageButton({ customId: `forceBtn_${interaction.id}`, emoji: '🔨', style: 'DANGER' })
  interaction.reply({ content: locale('leave_force_question_' + userIn, meAt.name), components: [{ components: [forceBtn], type: 1 }] })

  const forceInteraction = await interaction.channel?.awaitMessageComponent({ filter: (i) => i.customId === `forceBtn_${interaction.id}` && i.user.id === interaction.user.id })
  if (!forceInteraction) return

  forceInteraction.update({}).catch(() => {})
  interaction.editReply({ content: locale('leave_success'), components: [] })
  await player.stop(meAt)
}

export const metadata: ApplicationCommandData = {
  name: 'leave',
  description: 'stops the stream which is playing and leave the voice channel'
}
