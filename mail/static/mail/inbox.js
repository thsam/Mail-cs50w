document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send_email').addEventListener('click', () => send_email());
 

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mail-show').innerHTML="";

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-show').innerHTML="";


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  //agregado 
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emailData => {

    console.log(emailData);
    let containerEmail=document.querySelector("#emails-view");
    for (email of emailData){
      let emaildiv=document.createElement("div");
      let senders_or_recipients;
      if (mailbox==="inbox"){
        senders_or_recipients=email.sender
      } else { senders_or_recipients=email.recipients}
      emaildiv.innerHTML=`<li class="list-group-item ${email.id}"><b>${senders_or_recipients}</b> &nbsp;  ${email.subject} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ${email.timestamp}.</li>`;
      emaildiv.style = "cursor: pointer;";
      emaildiv.id=email.id
      containerEmail.appendChild(emaildiv);
      emaildiv.addEventListener('click', () => load_email(emaildiv.id,mailbox));   
      if(email.read && mailbox==="inbox"){

        emaildiv.firstChild.style="background-color:#E7E9EB;";
  
      }

    }
   
  });

}

function load_email(mail_id,mailbox){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-show').style.display = 'block';
  fetch('/emails/' + mail_id)
  .then(response => response.json())
  .then(email => {
    console.log(email)
    let container= document.querySelector("#mail-show");
    let contentEmail=document.createElement("div");
    let buttons=contentEmail=document.createElement("div");
    buttons.className="buttons-action"
    contentEmail.innerHTML=`<b>From: </b> ${email.sender} <br /><b>To:</b> ${email.recipients}<br /><b>Subject: </b>${email.subject}<br /> <b>Timestamp:</b> ${email.timestamp}<hr><p> ${email.body}</p>`;
    buttons.innerHTML+=`<button type="button" class="btn btn-primary">Reply</button>  <button type="button" class="btn  btn-warning">📥</button>`
    container.appendChild(contentEmail);
    button_archive= document.querySelector(".btn-warning");
    button_reply=document.querySelector(".btn-primary")
    button_archive.addEventListener('click', () => archive_email(email.id,email.archived));
    button_reply.addEventListener('click', () => reply_email(email,mailbox));  
    //Email Leído
    if(mailbox=="inbox"){
      email_read(mail_id)
    }

  
  });

}
function reply_email(email,mailbox){
  let reply_subject="",senders_or_recipients= mailbox==="sent"? email.recipients : email.sender;
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
 
  document.querySelector('#compose-recipients').value = senders_or_recipients;
  if(!email.subject.includes("Re")){ reply_subject= "Re: " }
  document.querySelector('#compose-subject').value = `${reply_subject}${email.subject}`;
  document.querySelector('#compose-body').value = `${email.timestamp} ${senders_or_recipients} wrote : ${email.body}  `;
  

  
}
function email_read(mail_id){
  fetch('/emails/' + mail_id, {
    method: 'PUT',
    body: JSON.stringify({
      read:true
    })
  });
}
function archive_email(mail_id,status){
  fetch('/emails/' + mail_id, {
    method: 'PUT',
    body: JSON.stringify({
      archived:!status
    })
  })
  .then(() => load_mailbox("inbox"));
}
function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  //Posts mail to /emails route.
  fetch('/emails', {
    method: 'POST', 
    body: JSON.stringify({
      "recipients": recipients,
      "subject": subject,
      "body": body
    })
  })
  .then(response => response.json())
  .then(result => {
    //Print result
    console.log(result);

  });
}