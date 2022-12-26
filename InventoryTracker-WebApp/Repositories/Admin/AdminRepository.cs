using InventoryTracker_WebApp.Domain.Admin;
using System;
using System.Net.Mail;
using System.Net;
using System.Web.Configuration;

namespace InventoryTracker_WebApp.Repositories.Admin
{
    public class AdminRepository : IAdminRepository
    {
        string connectionString;
        public AdminRepository()
        {
            connectionString = WebConfigurationManager.AppSettings["sqldb_connection"];
        }
        public string SendEmail(string bodyString, string userMail, string subject)
        {
            if (SendEmailUsingSmtp(bodyString, userMail, subject))
                return "Email sent successfully";
            else
                return "Email not sent";

        }
        public bool SendEmailUsingSmtp(string bodyString, string userMail, string subject)
        {
            bool result = false;
            try
            {
                string UserName = WebConfigurationManager.AppSettings["UserName"];
                string Password = WebConfigurationManager.AppSettings["Password"];
                MailMessage message = new MailMessage();
                SmtpClient smtp = new SmtpClient();
                message.From = new MailAddress(UserName);
                string[] singleEmail = userMail.Split(',');
                foreach (string email in singleEmail)
                {
                    message.To.Add(new MailAddress(email));
                }
                message.Subject = subject;
                message.IsBodyHtml = true; //to make message body as html  
                message.Body = bodyString;
                smtp.Port = 587;
                smtp.Host = "smtp.gmail.com"; //for gmail host  
                smtp.EnableSsl = true;
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new NetworkCredential(UserName, Password);
                smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                smtp.Send(message);
                result = true;
            }
            catch (Exception ex)
            {
                throw;
            }
            return result;
        }
    }
}