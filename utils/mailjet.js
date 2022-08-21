

const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    '69ee00422f1168808426d425d8aaec02',
    'd31129a97b576c02a4481453f4d981ce'
    // 'f5ea49aec11cf41abf33c50ac77c1ef4',
    // 'ff8ae0eed07b01d47dcd43874038625c',
);


module.exports = (userEmail, userName, subject, body) => {
     const sendEmail = mailjet
        .post('send', {
            version: 'v3.1'
        })
        .request({
            Messages: [{
                From: {
                    Email: "gomemahero@gmail.com",
                    Name: "Open Cart"
                },
                To: [{
                    Email: 'gomemahero@gmail.com',
                    Name: 'User'
                }],
                Subject: 'Welcome to Open Cart',
                TextPart: "Dear +userName+, welcome to OpenCart! May the cart brings happiness for you!",
                HTMLPart: '<h3>Dear ' + userName + ', welcome to OpenCart! May the cart brings happiness for you!</h3>'
            }]
        })

        return sendEmail;

}

