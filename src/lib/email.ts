/** Real email delivery is enabled only when SMTP settings are present. */
export const isEmailConfigured = (): boolean =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM_ADDRESS)
