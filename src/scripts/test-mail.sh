docker exec -i dovecot doveadm save -u clay << 'MAIL'
From: test1@example1.com
To: clay@claycurry.com
Subject: Test Emaill 1 from Dovecot
Date: Sat, 28 Dec 2024 16:20:00 +0000
Message-ID: <test1@dovecot.local>
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Hello Clay!

This is a Test Emaill to verify your Dovecot setup is working correctly.

Your IMAP server is configured and ready to use.

Best regards,
Dovecot Test
MAIL

docker exec -i dovecot doveadm save -u clay << 'MAIL'
From: test2@example2.com
To: clay@claycurry.com
Subject: Test Emaill 2 from Dovecot
Date: Sun, 29 Dec 2024 16:20:00 +0000
Message-ID: <test2@dovecot.local>
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Hello Clay!

This is a Test Emaill to verify your Dovecot setup is working correctly.

Your IMAP server is configured and ready to use.

Best regards,
Dovecot Test
MAIL

docker exec -i dovecot doveadm save -u clay << 'MAIL'
From: test3@example3.com
To: clay@claycurry.com
Subject: Test Emaill 3 from Dovecot
Date: Mon, 30 Dec 2024 16:20:00 +0000
Message-ID: <test3@dovecot.local>
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Hello Clay!

This is a Test Emaill to verify your Dovecot setup is working correctly.

Your IMAP server is configured and ready to use.

Best regards,
Dovecot Test
MAIL


docker exec -i dovecot doveadm save -u clay << 'MAIL'
From: test@example.com
To: clay@claycurry.com
Subject: Test Emaill from Dovecot
Date: Mon, 30 Dec 2024 16:20:00 +0000
Message-ID: <test@dovecot.local>
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Hello Clay!

This is a Test Emaill to verify your Dovecot setup is working correctly.

Your IMAP server is configured and ready to use.

Best regards,
Dovecot Test
MAIL