
function parsePreston(text){
    var lines = text.split('\n')
      , ret = []
      , curr = null
      , state = 'text' // possible states: text, notes, code
      , type= 'text'
    lines.forEach(function(line){
        console.log(line)
        /*if (!curr){
            curr = {text: '', notes: '', code: ''}
        }*/
        if (state === 'text'){
            if (line.match(/^---$/))
            {
                console.log("Second slide found")
                console.log(line)
                console.log(curr)
                ret.push(curr)
                curr=null
            }
            if (line.match(/^<pre>.*<\/pre>*$/)){
                curr.code += line
                state = 'text'
            }else if (line.match(/^<pre>/)){
                curr.code += line + '\n'
                state = 'code'
            }
            else if (line.match(/^<notes>.*<\/notes>*$/)){
                curr.notes += line
                state = 'text'
            }else if (line.match(/^<notes>/)){
                curr.notes += line + '\n'
                state = 'notes'
            }else if (!curr){
                    curr = {text: line + '\n', notes: '', code: ''}
                    state = 'text'
            }
            else{
                    curr.text += line + '\n'
                    state = 'text'
            }            
        }
        else if (state === 'code'){
                curr.code += line + '\n'
                if (line.match(/<\/pre>[ \t]*$/))
                    state = 'text'
        }
        else if (state === 'notes' ){
                curr.notes += line + '\n'
                if (line.match(/<\/notes>*$/))
                    state = 'text'
        }

        
    })
    if (curr && (curr.text || curr.code)){
        console.log(curr)
        ret.push(curr)
    }
    console.log(ret)
    return ret
}

function markdown(text){
    return (new (Showdown.converter)).makeHtml(text)
}

var index = -1, win, slides

function nextSlide(){
    var slide = slides[++index]
    if (!slide){
        index--
        return
    }
    showSlide(slide)
}
function prevSlide(){
    var slide = slides[--index]
    if (!slide){
        index++
        return
    }
    showSlide(slide)
}
function showSlide(slide){
    var content = win.document.getElementById('content')
      , localContent = document.getElementById('slide')
      , notes = document.getElementById('notes')
    slideText = slide.text || slide.code
    content.innerHTML = localContent.innerHTML = markdown(slideText)
    notes.innerHTML = markdown(slide.notes)
    win.$('a').attr('target', '_blank')
    win.fit()
}

function runSlides(slides){
    $('#prevBtn').click(prevSlide)
    $('#nextBtn').click(nextSlide)
    index = -1
    win = window.open('slide.html', 'slides', 
            'width=' + window.outerWidth + ',height=' + 
            window.outerHeight)
    win.moveTo(0, 0)
    
    setTimeout(function(){
        win.nextSlide = nextSlide
        win.prevSlide = prevSlide
        nextSlide()
    }, 500)
}

function resize(){
    var height = $(window).height()
    $('#layout').css({height: height + 'px'})
}

$(function(){
    $(window).resize(resize)
    resize()
    $('#prevBtn, #nextBtn').hide()
    $.ajax({
        url: 'presentation.md',
        dataType: 'text',
        success: function(data){
            $(document).keyup(function(e){
                var code = e.keyCode
        		if (code == 39)
        			nextSlide()
        		if (code == 37)
        			prevSlide()
            })
            $('#startBtn').click(function(){
                slides = parsePreston(data)
                runSlides(slides)
                $('.begin').removeClass('begin')
                $('#info').html('The slides are in a separate window. Use &larr; and &rarr; to flip slides')
                resize()
            })
        }
    })
})