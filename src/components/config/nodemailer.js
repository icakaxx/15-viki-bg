import nodemailer from 'nodemailer'

//Local enviroment variables
const email = process.env.NEXT_PUBLIC_EMAIL
const pass = process.env.NEXT_PUBLIC_EMAIL_PASS

/**
 * Creates a transport object for sending email.
 * @function
 * @name createTransport
 * @memberof module:nodemailer
 * @param {Object} options - An object containing options for the transport.
 * @param {string} options.service - The name of the email service to use (e.g. 'gmail').
 * @param {Object} options.auth - An object containing authentication details.
 * @param {string} options.auth.user - The email address to use for authentication.
 * @param {string} options.auth.pass - The password to use for authentication.
 * @returns {Object} A transport object that can be used to send email.
 */
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass,
  }
})

/**
 * Email options of who the email is coming from, and who it is being sent to. In this case,
 * The email is being sent from and to the same user, but the email contents are different based
 * on form submission data 
 */
export const mailOptionSelf = {
  from: email,
  to: email,
}

export const mailOption = {
    from: email,
  }