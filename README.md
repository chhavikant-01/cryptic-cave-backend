# Backend for [LinkUni](https://github.com/chhavikant-01/link-uni)

This repository contains the backend API for **LinkUni**, which powers the core functionalities such as authentication, database interactions, email notifications, file storage, and more.

---

## Getting Started  

1. **Clone the Repository**:  

   ```bash  
   git clone https://github.com/chhavikant-01/link-uni-backend.git
   ```  

2. **Install Dependencies**:  

   ```bash  
   npm install  
   ```  

3. **Set Up Environment Variables**:  

   Create a `.env` file in the root of your project and configure the following variables:  

   ```plaintext  
   # Database Configuration  
   MONGO_URL=<your_mongo_db_connection_string>  

   # Server Configuration  
   PORT=<port_number_for_backend>  
   LOCAL_PORT=<local_port_for_testing>  

   # JWT Configuration  
   JWT_SECRET=<your_jwt_secret_key>  
   JWT_EXPIRES=<jwt_expiration_time>  

   # URL Configurations  
   BASE_URL=<backend_base_url>  
   FRONTEND_BASE_URL=<frontend_base_url>  

   # Email SMTP Configuration  
   SMTP_HOST=<your_smtp_host>  
   SMTP_PORT=<your_smtp_port>  
   SMTP_SERVICE=<your_smtp_service_provider>  
   SMTP_MAIL=<your_email_address>  
   SMTP_PASSWORD=<your_email_password>  

   # AWS S3 Configuration  
   S3_SECRET_ACCESS_KEY=<your_aws_secret_access_key>  
   S3_ACCESS_KEY_ID=<your_aws_access_key_id>  
   AWS_REGION=<your_aws_region>  
   S3_BUCKET_NAME=<your_s3_bucket_name>  

   # Email Domain Restriction  
   EMAIL_ALLOWED_DOMAIN=<allowed_email_domain>  
   ```  

4. **Run the Backend Server**:
   
     ```bash  
     nodemon index.js  
     ```  
---

## AWS S3 Setup  

1. Create an S3 bucket in your AWS account.  
2. Configure IAM user permissions for programmatic access.  
3. Add the bucket name, access key, and secret key to your `.env` file.  

---

## SMTP Setup  

1. Use an email service provider like Gmail, SendGrid, or others.  
2. Enable "less secure app access" or configure OAuth for security.  
3. Add your SMTP details to the `.env` file.  

---

## Contribution Guide  

We welcome contributions! Follow these steps to set up the project locally:  

1. Fork this repository.  
2. Create a feature branch:  
   ```bash  
   git checkout -b feature/your-feature-name  
   ```  
3. Commit your changes:  
   ```bash  
   git commit -m "Add your message"  
   ```  
4. Push to your fork:  
   ```bash  
   git push origin feature/your-feature-name  
   ```  
5. Create a pull request!  

---

## License  

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).  

---

## Contact  

If you have questions, feel free to reach out: [Chhavikant Mahobia](https://sharespace.bio/chhavikant/professional)
