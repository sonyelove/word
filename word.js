const APP_TITLE = "ENGLISH STUDY HARD";

class Word {
    contId = "";
    cont = null;
    db = [];
    tout1 = null;
    tout2 = null;

    todoList = [];
    todoIdx = 0;
    exerCnt = 0;
    status = "ready"; // ready, playing, pause

    conf = {
        random : true,      // 랜덤Play
        autoplay : true,    // 자동Play
        wordfirst : true,   // true일 경우 단어먼저, 아닌경우 뜻(mean)먼저
        delay : 4000,       // 단어를 보여주고 뜻을 보여줄 대기시간
        sound : true,
        soundSpeed : 1.0,
        wordsound : true,   // 단어 TTS
        meansound : true,    // 뜻 TTS
        loop : true,
    }

    constructor(contId, str) {
        this.contId = contId;
        this.cont = $("#"+contId);
        this.parse(str);
        this.genChapterList();

        const _this = this;
        $("input[type=checkbox]").on("change", function(e){
            let val = $(e.target).is(":checked");
            console.log(  );

            if( e.target.id == "cf_random" ){
                
            }
            else if( e.target.id == "cf_sound" ){
                _this.conf.sound = val;
            }
            else if( e.target.id == "cf_loop" ){
                _this.conf.loop = val; 
            }
        });

        $("#cf_delay").on("change", function(e){
            let val = $(e.target).val(); 
            _this.conf.delay = val;   
            if( val == "2000" ){
                _this.conf.soundSpeed = 1.3;    
            }
            else if( val == "3000" ){
                _this.conf.soundSpeed = 1.2;    
            }
            else{
                _this.conf.soundSpeed = 1.0;    
            }
        });
    }

    parse(str){
        let sChapters = null;
        str = str.trim();
        sChapters = str.split("\n\n");
        // 전체
        for(let i=0; i<sChapters.length; i++){
            sChapters[i] = sChapters[i].trim();
            let sItems = sChapters[i].split("\n");
            
            let ctitle = "";
            let clist = [];
            // 챕터
            for(let j=0; j<sItems.length; j++){
                sItems[j] = sItems[j].trim();
                if(!sItems[j]) continue;
                let item = sItems[j].split("\t");
                if( !ctitle ){
                    ctitle = item.length==1 ? item[0] : "No TITLE";
                    continue;
                }
                
                let obj = {word : item[0]?item[0].trim():"", mean:item[1]?item[1].trim():""}
                clist.push(obj);    
            }
            this.db.push({id: "chapter_"+i, title:ctitle, list:clist});
        }
        //console.log(this.db);
        //console.log(this.db);
    }

    genChapterList(){
        this.cont.html("");
        const appTitle = $("<div/>", {id:"app_title", text: APP_TITLE});

        const chapterList = $("<div/>", {id:"chapter_list"});
        const title = $("<div/>", {class:"main-title"});
        const ul =  $("<ul/>");
        for(let i=0; i<this.db.length; i++){
            let li =  $("<li/>")
                .append( $("<input/>", {type:"checkbox", id:"chapter"+i, name:"checkedList", class:"check1", value:i}) )
                .append( $("<label/>", {for:"chapter"+i}).append( $("<span/>", {text:this.db[i].title})));
            ul.append(li);
        }
        const playButton = $("<div/>", {text:"▶️ play", class:"control-button play"}); 
        chapterList.append(title).append(ul).append(playButton);
        this.cont.append(appTitle);
        this.cont.append(`
            <div id="control_panel" style="display: none;">
                <!--
                <input type="checkbox" class="check2" id="cf_random" checked/><label><span>Random</span></label>
                <input type="checkbox" class="check2" id="cf_loop" checked/><label><span>Loop</span></label>
                -->
                <input type="checkbox" class="check2" id="cf_sound" checked/><label><span>Sound</span></label>
                Delay 
                <select id="cf_delay">
                    <option value="2000">2</option>
                    <option value="3000">3</option>
                    <option value="4000" selected>4</option>
                    <option value="5000">5</option>
                    <option value="6000">6</option>
                    <option value="7000">7</option>
                    <option value="8000">8</option>
                    <option value="9000">9</option>
                </select>
            </div>
        `);  
        this.cont.append(chapterList);

        const wordCard = $("<div/>", {id:"word_card"}); 
        const word = $("<div/>", {id:"word"}); 
        const mean = $("<div/>", {id:"mean"}); 
        const pauseButton = $("<div/>", {text:"⏸ pause", class:"control-button pause"}); 
        const backButton  = $("<div/>", {text:"⬅️ back" , class:"control-button back"}); 
        wordCard.append(word).append(mean);
        wordCard.append(pauseButton);
        wordCard.append(backButton);
        wordCard.hide(); 
        this.cont.append(wordCard);

        let _this = this;
        playButton.on("click", function(e){
            _this.play();            
        });

        pauseButton.on("click", function(e){
            //_this.play();    
            if( _this.status == "playing" ){
                _this.pause();
                
            }
            else if( _this.status == "pause" ){
                _this.resume();
            }

            
        });

        backButton.on("click", function(e){
            _this.back(); 
        });
        

    }

    play(){
        $("#chapter_list").hide();
        $("#control_panel").show();
        $("#word_card").show(); 
            
        let list = $('input:checkbox[name="checkedList"]:checked');
        if(list.length==0){
            alert('no selected item. please select one.')
        }
        this.todoList = [];
        this.todoIdx = 0;
        for(let i=0; i<list.length; i++){
            let idx = $(list[i]).val()*1;
            this.todoList = this.todoList.concat( this.db[idx].list ); 
        }
        this.shuffle(this.todoList);    
        this.nextWord();
        this.status = "playing";

        $(".control-button.play").hide();
    }

    /*
    conf = {
        random : true,      // 랜덤Play
        autoplay : true,    // 자동Play
        wordfirst : true,   // true일 경우 단어먼저, 아닌경우 뜻(mean)먼저
        delay : 3000,       // 단어를 보여주고 뜻을 보여줄 대기시간
        speech : true,
        wordsound : true,   // 단어 TTS
        meansound : true    // 뜻 TTS
    } */ 
    nextWord(){
        if( this.status == "pause" ) return; 
        
        $("#word").html("");
        $("#mean").html("");
        
        //let idx = parseInt(Math.random()*10000%this.todoLen);
        //console.log(this.todoIdx);
        let word = this.todoList[this.todoIdx][this.conf.wordfirst?"word":"mean"];
        let mean = this.todoList[this.todoIdx][this.conf.wordfirst?"mean":"word"];
        this.todoIdx = this.todoIdx + 1;
        if( this.todoIdx >= this.todoList.length ){
            this.todoIdx = 0;
        } 
        
        $("#word").html(word);  
        if( this.conf.sound ){
            window.speechSynthesis.cancel();
            speech(word, this.conf.soundSpeed);
        } 
        
        let _this = this;
        this.tout1 = setTimeout(function(){
            _this.nextMean(mean);
        }, this.conf.delay);
    }

    nextMean(mean){
        if( this.status == "pause" ) return;
        
        $("#mean").html(mean);
        
        if( this.conf.sound ){
            window.speechSynthesis.cancel();
            speech(mean, this.conf.soundSpeed);
        }

        let _this = this;
        this.tout2 = setTimeout(function(){
            _this.nextWord();
        }, this.conf.delay);

        this.exerCnt++;
    }

    pause(){
        window.speechSynthesis.cancel();
        this.status = "pause";
        $(".control-button.pause").text("▶️ resume");
    }

    resume(){
        if( this.status == "pause" )
            this.status = "playing";
        
        $(".control-button.pause").text("⏸ pause");
        this.nextWord();
    }

    back(){
        window.speechSynthesis.cancel();
        if( this.tout1 ){
            clearTimeout(this.tout1);
        }
        if( this.tout2 ){
            clearTimeout(this.tout2);
        }
        this.status = "ready";
        
        $(".control-button.play").show();
        $("#control_panel").hide();
        $("#word_card").hide();  
        $("#chapter_list").show();
    }

    shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }
}

var voices = [];
function setVoiceList() {
    voices = window.speechSynthesis.getVoices();
    //console.log(voices)
}

setVoiceList();

if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = setVoiceList;
}

function speech(txt, speed) {
    
    let lang = "ko-KR";
    if( /^[a-zA-Z0-9]/.test(txt) ){
        lang = "en-US"; 
    }

    if(!window.speechSynthesis) {
        alert("음성 재생을 지원하지 않는 브라우저입니다. 크롬, 파이어폭스 등의 최신 브라우저를 이용하세요");
        return;
    }

    //var lang = 'ko-KR';
    
    var utterThis = new SpeechSynthesisUtterance(txt);

    utterThis.onend = function (event) {
        console.log('end');
    };

    utterThis.onerror = function(event) {
        console.log('error', event);
    };

    var voiceFound = false;

    for(var i = 0; i < voices.length ; i++) { 
        if(voices[i].lang.indexOf(lang) >= 0 || voices[i].lang.indexOf(lang.replace('-', '_')) >= 0) {
            utterThis.voice = voices[i];
            voiceFound = true;
        }
    }
    if(!voiceFound) {
        alert('voice not found');
        return;
    }

    utterThis.lang = lang;
    utterThis.pitch = 1;
    utterThis.rate = speed; //속도

    //window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterThis);
}

function g_gout(){
    var t = document.getElementById("code_reddit");
    speech(t.value);
}