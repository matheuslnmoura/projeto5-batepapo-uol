let messages = [];
let messagesPromise
let userName="";
let typeOfMessage = "message";
let messageAddressing = "Todos";
let participants = [];
let messageObject = {};
let onlineParticipantsInterval = null;

let mapTeste =[];


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
    informOnlineParticipants();
    informUserStatus();
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
    let onlineParticipantsPromise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
    onlineParticipantsPromise.then(renderParticipants);
    onlineParticipantsPromise.catch(renderParticipantsError);
    
    onlineParticipantsInterval = setInterval(()=>{
        onlineParticipantsPromise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
        onlineParticipantsPromise.then(renderParticipants);
        onlineParticipantsPromise.catch(renderParticipantsError);
    }, 10000);
}



function loadPromises() {
    messagesPromise = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages');
    messagesPromise.then(createChatInterface);
    messagesPromise.catch(displayLoadingErrorMessage);
    setInterval(()=>{
        messagesPromise = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages');
        messagesPromise.then(createChatInterface);
        messagesPromise.catch(displayLoadingErrorMessage);
    }, 3000);
        
}


function createChatInterface(messagesPromiseResponse) {
    let messagesObject = messagesPromiseResponse.data
    if(document.querySelector('.chat-area .loading') !== null){
        document.querySelector('.chat-area .loading').classList.add('no-display');
    }
    document.querySelector('.chat-area').innerHTML = '';
    
    mapTeste = messagesObject.map((item) => {
        if(!(item.type === "private_message" && item.from !== userName && item.to !==userName)){
            if(item.type ==='private_message') {
                document.querySelector('.chat-area').innerHTML +=
                `
                <div class="message type-${item.type}" data-identifier = "message">
                    <div class="container">
                        <span class="time-stamp">${item.time} </span>
                        <span class="user-name"><b>${item.from}</b> </span>
                        <span class="addressing">reservadamente para <b>${item.to}</b></span>
                        <span class="message-text">${item.text}</span>
                    </div>
                </div>
                `;
            } else if (item.type !== "status") {
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
    if (document.querySelector('.section.contacts .contacts.participants') !== null){
        document.querySelector('.section.contacts .contacts.participants').innerHTML = '';
    }
    participants.map((item)=>{
        document.querySelector('.section.contacts .contacts.participants').innerHTML +=
        `
        <div class="line contact">
            <div class="flex-distribution">
                <img src="assets/media/user-icon.svg" alt="Participants Icon">
                <span class="user-name" data-identifier="participant">${item.name}</span>
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

    restoreDefaultMessageConfig()
    informOnlineParticipants();

    document.querySelector('.input-area .container input').value = '';
  
}

function addressingClickEvent() {
    console.log('Renderizou participantes');
    Array.from(document.querySelectorAll('.side-menu .contacts .line')); 

    Array.from(document.querySelectorAll('.side-menu .contacts .line')).map((item)=>{
    item.addEventListener("click", ()=>{
        clearInterval(onlineParticipantsInterval);
        messageAddressing="";
        messageAddressing = item.querySelector('.user-name').innerHTML;
        messageInfoOverview();

        if (item.querySelector('.contacts .check-icon').classList.contains('no-display')) {
            if (document.querySelector('.contacts .check-icon.active') !== null){
                document.querySelector('.contacts .check-icon.active').classList.add('no-display');
                document.querySelector('.contacts .check-icon.active').classList.remove('active');
    
                item.querySelector('.contacts .check-icon').classList.remove('no-display');
                item.querySelector('.contacts .check-icon').classList.add('active');

            } else {
                restoreDefaultMessageConfig();
            }

        } 
    });
});
};

function restoreDefaultMessageConfig() {
    document.querySelector('.contacts .send-to-all .check-icon').classList.remove('no-display');
    document.querySelector('.contacts .send-to-all .check-icon').classList.add('active');

    document.querySelector('.message-visibility .public.check-icon').classList.remove('no-display');
    document.querySelector('.message-visibility .public.check-icon').classList.add('active');
    document.querySelector('.message-visibility .private.check-icon').classList.add('no-display');
    document.querySelector('.message-visibility .private.check-icon').classList.remove('active');

    typeOfMessage = "message";
    messageAddressing = "Todos";
    messageInfoOverview();
};

function messageInfoOverview() {
    let messageVisibility = "";

    if(typeOfMessage === "message"){
        messageVisibility = "Público";
    } else {
        messageVisibility = "Privada";
    }

    document.querySelector('.message-info-container').innerHTML = 
    `
    <span class="for">para: <i><b>${messageAddressing}</b></i></span>
    <span class="privacy">Visibilidade: <i><b>${messageVisibility}</b></i></span>
    `
}


document.querySelector('.login-screen button').addEventListener("click", verifyUserLogin);
document.querySelector('.login-screen input').addEventListener('keypress', (e) =>{
    if (e.key === 'Enter'){
        verifyUserLogin();
    }
});

document.querySelector('.site-overlay').addEventListener("click", hideSideMenu);

document.querySelector('header .container button').addEventListener("click", showSideMenu);

document.querySelector('.input-area .container button').addEventListener('click', sendUserMessage);

document.querySelector('.input-area .container input').addEventListener('keypress', (e) =>{
    if (e.key === 'Enter'){
        sendUserMessage();
    }
});


let messageVisibilityOptions = Array.from(document.querySelectorAll('.side-menu .message-visibility .line')); 

messageVisibilityOptions.map((item)=>{
    item.addEventListener("click", ()=>{
        typeOfMessage="";
        typeOfMessage = item.getAttribute('visibility');
        messageInfoOverview();

        if (item.querySelector('.message-visibility .check-icon').classList.contains('no-display')) {
            document.querySelector('.message-visibility .check-icon.active').classList.toggle('no-display');
            document.querySelector('.message-visibility .check-icon.active').classList.toggle('active');

            item.querySelector('.message-visibility .check-icon').classList.toggle('no-display');
            item.querySelector('.message-visibility .check-icon').classList.toggle('active');
        } 
    });
});


