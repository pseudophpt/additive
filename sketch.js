const screen_width = 720;
const screen_height = 720;

const half_width = (screen_width / 2);
const half_height = (screen_height / 2);

const scaley = 100;
const scalex = 300;

const c1 = '#ffcc00';
const c2 = '#222222';
const c3 = '#22222240';
const c4 = '#ffcc0040';

var terms = 1;

var visible_values;
var values;
var visible_real_values;
var real_values;
var visible_gterms;
var gterms;

var get_real_value;

var osc;
var gain;

var real;
var imag;

var audioCtx;

var real_gets;
var imag_gets;

var cur_wave;

var img_srcs;

function init_waves () {
    cur_wave = 0;
    
    real_gets = [];
    imag_gets = [];
    get_real_value = [];
    img_srcs = [];
    
    real = [0, 0];
    imag = [0, 4 / PI];
    
    img_srcs.push("square.png");
    
    real_gets.push(function (t) {
        var r = [0];
        
        for (var i = 0; i < t; i ++) {
            r.push(0);
            r.push(0);
        }
        
        return new Float32Array(r);
    });
    
    imag_gets.push(function (t) {
        var r = [0];
        
        for (var i = 0; i < t; i ++) {
            r.push(4/(PI*((2*(i+1))-1)));
            r.push(0);
        }
        
        return new Float32Array(r);
    });
    
    get_real_value.push(function (t) {
        var t2 = t - floor(t);
        if (t2 < 0.5) {
            return 1;
        }
        else return -1;
    });
    
    img_srcs.push("saw.png");
    
    real_gets.push(function (t) {
        var r = [0];
        
        for (var i = 0; i < t; i ++) {
            r.push(0);
        }
        
        return new Float32Array(r);
    });
    
    imag_gets.push(function (t) {
        var r = [0];
        
        for (var i = 0; i < t; i ++) {
            r.push(4/(PI*2*(i+1)));
        }
        
        return new Float32Array(r);
    });
    
    get_real_value.push(function (t) {
        var t2 = t - floor(t);
        return (0.5-t2) * 2;
    });
    
    img_srcs.push("tri.png");
   
    real_gets.push(function (t) {
        var r = [0];
        
        for (var i = 0; i < t; i ++) {
            r.push(0);
            r.push(0);
        }
        
        return new Float32Array(r);
    });
    
    imag_gets.push(function (t) {
        var r = [0];
        
        for (var i = 0; i < t; i ++) {
            var sign = -1;
            if (i % 2 == 0)
                sign = 1; 
            r.push((8 / (PI * PI * ((i * 2) + 1) * ((i * 2) + 1))) * sign);
            r.push(0);
        }
        
        return new Float32Array(r);
    });
    
    get_real_value.push(function (t) {
        var t2 = (t + 0.25) - floor(t + 0.25);
        return 1 - 4 * abs(0.5 - t2) 
    });
    
    img_srcs.push("trap.png");
   
    real_gets.push(function (t) {
        var r = [0];
        
        for (var i = 0; i < t; i ++) {
            r.push(0);
            r.push(0);
        }
        
        return new Float32Array(r);
    });
    
    imag_gets.push(function (t) {
        var r = [0];
        
        for (var i = 0; i < t; i ++) {
            var sign = -1;
            if (i % 4 < 2)
                sign = 1;
            r.push(sign * sqrt(2) * 8 / (PI * PI * ((i * 2) + 1) * ((i * 2) + 1))) ;
            r.push(0);
        }
        
        return new Float32Array(r);
    });
    
    get_real_value.push(function (t) {
        var t2 = (t / 2) - floor(t / 2);
        var t3 = t - floor(t);
        var t4 = 2 * t - floor(t * 2);
        var t5 = 4 * t - floor(t * 4);
        
        var r = 1;
        
        if (t5 < 0.5) {
            r = t5 * 2;
        }
        
        if (t4 >= 0.5) {
            r -= t5 * 2;
            r += 1;
        }
        
        if (t3 > 0.5) {
            r *= -1;
        }
        
        return r;
    });

}

function get_value (t) {
    var ret = 0;
    for (var i = 0; i < real.length; i ++) {
        ret += real[i]*cos(i * TAU * t);
    }
    
    for (var i = 0; i < imag.length; i ++) {
        ret += imag[i]*sin(i * TAU * t);
    }
    
    return ret;
}

function init_webaudio () {
    audioCtx = new AudioContext();
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    osc = audioCtx.createOscillator();
    
    gain = audioCtx.createGain();
    gain.gain.value = 0.05;
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    real = new Float32Array([0, 0]);
    imag = new Float32Array([0, 1]);
    
    wave = audioCtx.createPeriodicWave(real, imag);
    
    osc.setPeriodicWave(wave);
    
    osc.start();
}

function prev_wave () {
    cur_wave --;
    if (cur_wave < 0)
        cur_wave = img_srcs.length - 1;
    
    update_waveicon();
    update_tone();
    update_values();
}

function next_wave () {
    cur_wave ++;
    
    if (cur_wave >= img_srcs.length)
        cur_wave = 0;
    
    update_waveicon();
    update_tone();
    update_values();
}

function add_term () {
    terms ++;
    
    update_terms();
    update_tone();
    update_values();
}

function del_term () {
    terms --;
    if (terms < 0)
        terms = 0;
    
    update_terms();
    update_tone();
    update_values();
}

function update_tone () {
    real = real_gets[cur_wave](terms);
    imag = imag_gets[cur_wave](terms);
    
    wave = audioCtx.createPeriodicWave(real, imag);
    
    osc.setPeriodicWave(wave);
}

function update_terms () {
    document.getElementById("terms").innerHTML = terms;
}

function update_waveicon () {
    document.getElementById("wave").src = img_srcs[cur_wave];
}

function update_values () {
    values = [];
    real_values = [];
    gterms = [];
    
    for (var i = 0; i < screen_width; i ++) {
        var x = (i - half_width) / scalex;
        values[i] = get_value(x);
    }
    
    for (var i = 0; i < screen_width; i ++) {
        var x = (i - half_width) / scalex;
        real_values[i] = get_real_value[cur_wave](x);
    }
    
    for (var i = 0; i < screen_width; i ++) {
        var term = imag[floor(i * imag.length / screen_width)];
        gterms[i] = term;
    }
} 

function init_visible () {
    visible_values = [];
    visible_real_values = [];
    visible_gterms = [];
    for (var i = 0; i < screen_width; i ++) {
        visible_values[i] = 0;
        visible_real_values[i] = 0;
        visible_gterms[i] = 0;
    }
}

function update_visible () {
    for (var i = 0; i < screen_width; i ++) {
        visible_values[i] = ((visible_values[i] * 3) + (values[i])) / 4;
        visible_real_values[i] = ((visible_real_values[i] * 3) + (real_values[i])) / 4;
        visible_gterms[i] = ((visible_gterms[i] * 3) + (gterms[i])) / 4;
    }
}

function round_thousandths (num) {
    return round(num * 1000) / 1000;
}


function setup () {
    createCanvas (screen_width, screen_height);
   
    init_visible ();
    init_webaudio ();
    init_waves ();
    
    for (var i = 0; i < img_srcs.length; i ++) {
        (new Image()).src = img_srcs[i];
    } 
    
    cur_wave = 0;
    update_values();
}

function draw () {
    background(0);
    strokeWeight(1);
    
    update_visible();
    
    /* Axes */
    stroke(c2);
    
    line(0, half_height, screen_width, half_height); /* X */
    line(half_width, scaley * 2, half_width, screen_height - (scaley * 2)); /* Y */

    stroke(c4);
    line(0, scaley, screen_width, scaley);
    
    /* Function */
    
    for (var i = 0; i < screen_width; i ++) {
        /* i and j are screen pixels, x and y are mathematical points */
        
        var y = visible_real_values[i];
        var j = half_height - (y * scaley);
        
        y = visible_values[i];
        var j2 = half_height - (y * scaley);
        
        stroke(c3);
        line(i, j, i, j2);
        
        stroke(c4);
        point (i, j);
        
        stroke(c1);
        point (i, j2);
        
        stroke(c1);
        var y = visible_gterms[i] * scaley / 2;
        j2 = scaley - (y);
        line(i, scaley, i, j2);
    }
}
