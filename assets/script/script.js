let messages = [];
let messagesPromise
let userName="";
let typeOfMessage = "message";
let messageAddressing = "Todos";
let participants = [];
let messageObject = {};


function verifyUserLogin() {
    userName = document.querySelector('.login-screen input').value;
    let userObject = {name: document.querySelector('.login-screen input').value};
    let loginPromise = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', userObject);

    loginPromise.then(enterTheChatRoom);
    loginPromise.catch(chosenNameAlreadyInUse);
}

function enterTheChatRoom() {
    document.querySelector('.login-screen').classList.add('no-display');
    document.querySelector('.site-container').classList.remove('no-display');
    informOnlineParticipants()
    informUserStatus()
    loadPromises();
}

function chosenNameAlreadyInUse() {
    let chosenName = document.querySelector('.login-screen input').value
    document.querySelector('.login-error-modal').classList.remove('no-display');
    setTimeout(()=>{
        document.querySelector('.login-error-modal').classList.add('opacity-control-on');
    }, 100);

    if (chosenName === '') {
        document.querySelector('.login-error-modal').innerHTML = 'Campo de nome de usuário obrigatório'
    } else {
        document.querySelector('.login-error-modal').innerHTML = `O nome ${chosenName} já está em uso. Por favor, escolha outro nome.`
    }

    document.querySelector('.login-screen').addEventListener('click', ()=>{
        document.querySelector('.login-error-modal').classList.remove('opacity-control-on');

        setTimeout(()=>{
            document.querySelector('.login-error-modal').classList.add('no-display');
            location.reload();
        }, 800);

        
    })
}


function informUserStatus() {
    setInterval(()=>{
        axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {name: userName});
    }, 5000);
}


function informOnlineParticipants() {
    setInterval(()=>{
       let onlineParticipantsPromise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
        onlineParticipantsPromise.then(renderParticipants);
        onlineParticipantsPromise.catch(renderParticipantsError);
    }, 10000);
}



function loadPromises() {
    messagesPromise = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages');
    setInterval(()=>{
        messagesPromise = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages');
        messagesPromise.then(createChatInterface);

    }, 3000);
        messagesPromise.catch(displayLoadingErrorMessage);
}


function createChatInterface(messagesPromiseResponse) {
    let messagesObject = messagesPromiseResponse.data
    document.querySelector('.chat-area .loading').classList.add('no-display');
    
    messagesObject.map((item) => {
        if(!(item.type === "private_message" && item.from !== userName && item.to !==userName)){
            document.querySelector('.chat-area').innerHTML +=
            `
            <div class="message type-${item.type}" data-identifier = "message">
                <div class="container">
                    <span class="time-stamp">${item.time} </span>
                    <span class="user-name"><b>${item.from}</b> </span>
                    <span class="addressing">para <b>${item.to}</b></span>
                    <span class="message-text">${item.text}</span>
                </div>
            </div>
            `;
        }
        
    });
    
    scrollToBottom();
}

function scrollToBottom() {
    document.querySelector('.chat-area').scrollTo(0, document.querySelector('.chat-area').scrollHeight);
}


function displayLoadingErrorMessage(messagesPromiseResponse) {
    document.querySelector('.chat-area .loading').innerHTML = 
    `
        Erro: Não foi possível carregar as mensagens :(
    `
}



function showSideMenu() {
    document.querySelector('aside').classList.add('right-transition');
    setTimeout(()=>{
        document.querySelector('.site-overlay').classList.add('overlay-bg');
    }, 200);
}

function renderParticipants(participantsResponse) {
    participants = participantsResponse.data;
    participants.map((item)=>{
        document.querySelector('.section.contacts').innerHTML +=
        `
        <div class="line contact">
            <div class="flex-distribution">
                <img src="assets/media/user-icon.svg" alt="Participants Icon">
                <span class="user-name">${item.name}</span>
            </div>
            <img class="check-icon no-display" src="assets/media/check-icon.svg" alt="">
        </div>
        `;
    })

    addressingClickEvent();
}

function renderParticipantsError(error) {
    document.querySelector('.section.contacts').innerHTML = "Não foi possível carregar a lista de participantes online"
}

function hideSideMenu() {
    document.querySelector('aside').classList.toggle('right-transition');
}

function sendUserMessage() {
    let userMessage = document.querySelector('.input-area .container input').value;
    
    messageObject = {
        from: userName,
        to: messageAddressing,
        text: userMessage,
        type: typeOfMessage
    }

    axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", messageObject);

    document.querySelector('.input-area .container input').value = '';
  
}

function addressingClickEvent() {
    Array.from(document.querySelectorAll('.side-menu .contacts .line')); 

    Array.from(document.querySelectorAll('.side-menu .contacts .line')).map((item)=>{
    item.addEventListener("click", ()=>{
        messageAddressing="";
        messageAddressing = item.querySelector('.user-name').innerHTML

        if (item.querySelector('.contacts .check-icon').classList.contains('no-display')) {
            document.querySelector('.contacts .check-icon.active').classList.add('no-display');
            document.querySelector('.contacts .check-icon.active').classList.remove('active');

            item.querySelector('.contacts .check-icon').classList.remove('no-display');
            item.querySelector('.contacts .check-icon').classList.add('active');
        } 
    });
});
}




document.querySelector('.login-screen button').addEventListener("click", verifyUserLogin);

document.querySelector('.site-overlay').addEventListener("click", hideSideMenu);

document.querySelector('header .container button').addEventListener("click", showSideMenu);

document.querySelector('.input-area .container button').addEventListener('click', sendUserMessage);

let messageVisibilityOptions = Array.from(document.querySelectorAll('.side-menu .message-visibility .line')); 

messageVisibilityOptions.map((item)=>{
    item.addEventListener("click", ()=>{
        typeOfMessage="";
        typeOfMessage = item.getAttribute('visibility');

        if (item.querySelector('.message-visibility .check-icon').classList.contains('no-display')) {
            document.querySelector('.message-visibility .check-icon.active').classList.add('no-display');
            document.querySelector('.message-visibility .check-icon.active').classList.remove('active');

            item.querySelector('.message-visibility .check-icon').classList.remove('no-display');
            item.querySelector('.message-visibility .check-icon').classList.add('active');
        } 
    });
});


