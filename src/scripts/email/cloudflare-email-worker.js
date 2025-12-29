/**
 * Cloudflare Email Worker
 * 
 * Receives email and stores directly to EFS via Lambda.
 * No SMTP forwarding needed - Lambda writes to Maildir.
 * 
 * Environment variables (set in Cloudflare dashboard):
 * - API_ENDPOINT: Your API Gateway URL (from CloudFormation output)
 * - API_KEY: Secret key for authentication
 */

export default {
  async email(message, env, ctx) {
    try {
      // Get raw email as bytes
      const rawEmail = await new Response(message.raw).arrayBuffer();
      const base64Email = btoa(String.fromCharCode(...new Uint8Array(rawEmail)));
      
      // POST to Lambda → writes to EFS
      const response = await fetch(env.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': env.API_KEY,
        },
        body: JSON.stringify({
          action: 'deliver',
          raw_email: base64Email,
          from: message.from,
          to: message.to,
          subject: message.headers.get('subject'),
        }),
      });
      
      if (!response.ok) {
        console.error(`Delivery failed: ${response.status}`);
        message.setReject(`Delivery failed`);
        return;
      }
      
      console.log(`Email delivered from ${message.from}`);
      
    } catch (error) {
      console.error(`Error: ${error.message}`);
      message.setReject(`Server error`);
    }
  },
};
