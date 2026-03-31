
if (type === 4) {// frog

    // body
    fill(110, 50, 75);
    ellipse(x, y, 18, 12);
    // head bump
    ellipse(x + 6, y - 2, 10, 9);
    // eyes
    fill(0, 0, 100);
    ellipse(x + 8, y - 6, 4, 4);
    ellipse(x + 3, y - 6, 5, 5);
    fill(0, 0, 0);
    ellipse(x + 8, y - 6, 2, 2);
    ellipse(x + 3, y - 6, 2, 2);
    //legs
    fill(110, 60, 65);
    ellipse(x - 6, y + 5, 8, 5);
    ellipse(x + 8, y + 5, 6, 3);


} if (type === 5) { // fish

    fill(200, 60, 90);
    ellipse(x, y, 18, 10); // body
    // tail
    triangle(x - 8, y, x - 15, y - 5, x - 15, y + 5);
    // eye
    fill(0, 0, 100);
    ellipse(x + 5, y - 1, 4, 4);
    fill(0, 0, 0);
    ellipse(x + 5, y - 1, 2, 2);

} if (type === 6) { // sheep

    // wool
    fill(20, 0, 90);
    ellipse(x, y, 16, 12);
    ellipse(x - 6, y, 10, 8);
    ellipse(x + 6, y, 10, 8);
    ellipse(x, y - 5, 12, 8);
    // face
    fill(30, 0, 50);
    ellipse(x + 12, y - 2, 3, 6);
    fill(20, 0, 20);
    ellipse(x + 8, y - 2, 8, 8);
    fill(30, 0, 70);
    ellipse(x + 4, y - 2, 4, 7);


} if (type === 7) {// cow

    fill(0, 0, 255);
    ellipse(x, y, 25, 15); // body
    ellipse(x + 13, y - 2, 8, 8); //head
    // spots
    fill(0, 0, 20);
    ellipse(x - 3, y, 6, 4);
    ellipse(x + 5, y - 3, 5, 3);
    ellipse(x + 10, y - 5, 4, 4);
    //nose
    fill(350, 20, 90);
    ellipse(x + 15, y, 5, 5);


} if (type === 8) { // fox

    fill(20, 200, 240);
    ellipse(x, y, 18, 10); // body
    // head
    triangle(x + 8, y - 6, x + 16, y, x + 8, y + 2);
    //nose
    fill(0, 0, 20);
    ellipse(x + 16, y, 2, 1);
    // tail
    fill(0, 0, 255);
    triangle(x - 8, y, x - 21, y - 5, x - 15, y);
    fill(20, 200, 240);
    triangle(x - 8, y, x - 21, y - 5, x - 13, y - 6);

} if (type === 9) { // chicken

    // comb
    fill(0, 200, 220);
    ellipse(x + 4, y - 8, 5, 3);

    fill(0, 0, 255);
    ellipse(x, y, 14, 11); // body
    ellipse(x + 4, y - 5, 7, 6); // head
    // beak
    fill(40, 200, 255);
    triangle(x + 7, y - 6, x + 10, y - 4, x + 7, y - 3);
    //tail
    fill(0, 0, 255);
    triangle(x - 6, y + 2, x - 6, y - 2, x - 12, y);

} if (type === 10) {// ladybug

    push(); scale(0.5);
    fill(0, 220, 220);
    ellipse(x, y, 13, 10); // shell
    // head
    fill(0, 0, 20);
    ellipse(x - 5, y - 1, 5, 5);
    // dots
    ellipse(x + 2, y - 2, 3, 2);
    ellipse(x - 1, y + 2, 3, 3);
    ellipse(x + 4, y + 2, 3, 2);
    pop();

} if (type === 11) {  // turtle

    // shell
    fill(120, 45, 65);
    ellipse(x, y, 18, 12);
    // head
    fill(120, 35, 80);
    ellipse(x + 10, y - 1, 6, 6);
    // legs
    ellipse(x - 6, y + 6, 4, 3);
    ellipse(x + 4, y + 6, 4, 3);


} if (type === 12) { // tortoise

    // shell
    fill(70, 35, 55);
    ellipse(x, y, 20, 12);
    // head
    fill(80, 30, 65);
    ellipse(x + 11, y, 6, 6);
    // legs
    rect(x - 7, y + 4, 4, 3, 1);
    rect(x + 1, y + 4, 4, 3, 1);


} if (type === 13) { // lizard

    // body
    fill(130, 55, 80);
    ellipse(x, y, 18, 6);
    ellipse(x + 10, y - 1, 7, 4); // head
    triangle(x - 8, y - 1, x - 28, y, x - 8, y + 2); // tail
    // legs
    ellipse(x - 4, y + 4, 4, 3);
    ellipse(x + 4, y + 4, 4, 3);


} if (type === 14) {// bat

    fill(0, 0, 25);
    // wings
    triangle(x - 10, y, x, y - 6, x, y + 4);
    triangle(x + 10, y, x, y - 6, x, y + 4);
    triangle(x - 8, y, x - 2, y - 1, x - 9, y - 8);
    triangle(x + 8, y, x + 2, y - 1, x + 9, y - 8);
    ellipse(x, y - 1, 6, 11); // body
    // ears
    fill(0, 0, 35);
    triangle(x - 2, y - 7, x - 1, y - 10, x, y - 5);
    triangle(x + 2, y - 7, x + 1, y - 10, x, y - 5);


} if (type === 15) {// shrimp

    push(); scale(0.3);
    fill(15, 50, 95);
    // body curve
    ellipse(x, y, 12, 9);
    ellipse(x - 7, y + 1, 9, 7);
    ellipse(x - 13, y + 1, 8, 4);
    ellipse(x + 7, y - 1, 8, 7); // head
    triangle(x - 16, y, x - 16, y + 3, x - 22, y + 3); // tail
    // eye
    fill(0, 0, 20);
    ellipse(x + 8, y - 2, 3, 2);
    // antenna
    stroke(15, 60, 80);
    line(x + 8, y + 3, x + 16, y + 8);
    line(x + 6, y + 3, x + 14, y + 9);
    noStroke();
    pop();

} if (type === 16) { // hippo

    fill(300, 15, 65);
    ellipse(x, y, 25, 17); // body
    ellipse(x + 13, y - 4, 12, 10); // head
    ellipse(x + 17, y + 1, 10, 10); // head
    // ears
    ellipse(x + 11, y - 10, 4, 4);
    ellipse(x + 15, y - 10, 3, 4);
    fill(0, 0, 25)
    ellipse(x + 11, y - 9, 2, 2);
    ellipse(x + 15, y - 9, 2, 2);
    // nostrils
    fill(0, 0, 45);
    ellipse(x + 15, y, 2, 2);
    ellipse(x + 19, y - 1, 2, 2);

} if (type === 17) {//duck
    // body — yellow
    push(); scale(0.7);
    fill(55, 80, 100);
    ellipse(x, y, 14, 8);
    fill(210, 70, 60);
    triangle(x - 6, y + 1, x - 5, y - 2, x - 12, y);// tail
    ellipse(x + 5, y - 5, 7, 6);// head 
    // wing — blue
    fill(210, 70, 60, 180);
    ellipse(x, y - 1, 11, 5);
    // beak
    fill(40, 90, 100);
    triangle(x + 8, y - 5, x + 11, y - 4, x + 8, y - 3);
    // eye
    fill(0, 0, 0);
    ellipse(x + 6, y - 6, 1.5, 1.5);
    pop();

} if (type === 18) {// bee

    push(); scale(0.7);
    // body
    fill(50, 90, 95);
    ellipse(x, y, 18, 12);
    // stripes
    stroke(0, 0, 20);
    line(x - 4, y - 5, x - 4, y + 5);
    line(x, y - 6, x, y + 6);
    noStroke();
    // head
    fill(0, 0, 30);
    ellipse(x - 9, y - 1, 6, 6);
    // wings
    fill(0, 0, 100, 50);
    ellipse(x + 2, y - 7, 12, 8);
    ellipse(x + 4, y - 4, 15, 6);
    // stinger
    fill(60);
    triangle(x + 9, y + 2, x + 9, y - 2, x + 14, y);
    pop();

} if (type === 19) {// polar bear

    fill(0, 0, 92);
    ellipse(x, y, 28, 20);           // body
    ellipse(x + 10, y - 4, 14, 12); // head
    ellipse(x + 10, y + 8, 8, 12);//legs
    ellipse(x - 10, y + 8, 8, 12);
    fill(0, 0, 88);
    ellipse(x + 9, y - 9, 6, 6);    // ear L
    ellipse(x + 13, y - 9, 6, 6);    // ear R
    fill(0, 0, 0);
    ellipse(x + 15, y - 5, 2, 2);   // eye
    ellipse(x + 12, y - 5, 2, 2);
    fill(0, 0, 35);
    ellipse(x + 15, y - 1, 4, 3);   // nose

} if (type === 20) {// penguin

    fill(0, 0, 15);
    ellipse(x - 2, y + 15, 6, 4);
    ellipse(x + 3, y + 15, 6, 4);
    ellipse(x, y + 2, 18, 26);       // body
    fill(0, 0, 95);
    ellipse(x, y + 3, 12, 18);       // belly
    fill(52, 52, 90);
    ellipse(x, y - 4, 8, 4);      //neck
    fill(0, 0, 10);
    ellipse(x, y - 10, 12, 12);      // head
    fill(10, 80, 50);
    ellipse(x, y - 8, 6, 3);         // beak
    fill(235, 35, 30);
    ellipse(x - 8, y + 1, 4, 10);    // wing L
    ellipse(x + 8, y + 1, 4, 9);    // wing R
    fill(0, 0, 95);
    ellipse(x - 2, y - 11, 3, 3);    // eye L
    ellipse(x + 2, y - 11, 3, 3);    // eye R
    fill(0, 0, 0);
    ellipse(x - 2, y - 10, 1.5, 2);
    ellipse(x + 2, y - 10, 1.5, 2);

} if (type === 21) { // seal

    fill(30, 15, 50);
    ellipse(x + 14, y + 6, 7, 4);   // flipper L
    fill(30, 20, 60);
    ellipse(x, y, 32, 18);           // body
    ellipse(x - 17, y + 5, 18, 8); //taail
    ellipse(x - 16, y + 1, 14, 8);
    ellipse(x + 15, y - 7, 14, 11); // head
    fill(30, 15, 50);
    ellipse(x + 6, y + 8, 11, 4);   // flipper R
    fill(0, 0, 0);
    ellipse(x + 14, y - 8, 3, 2);   // eye
    ellipse(x + 19, y - 8, 3, 2);
    fill(10, 20, 30);
    ellipse(x + 18, y - 5, 5, 3);   // nose
    stroke(30, 20, 35);
    strokeWeight(0.7);
    line(x + 19, y - 5, x + 23, y - 4);  // whiskers
    line(x + 19, y - 6, x + 23, y - 7);
    noStroke();

} if (type === 22) {//fish
    let h = random(360), s = random(50, 90), b = random(80, 100);
    fill(h, 70, 70);
    ellipse(x, y, 20, 11);           // body
    triangle(x - 9, y, x - 17, y - 6, x - 17, y + 6); // tail
    fill(h, 50, b);
    ellipse(x - 1, y, 16, 7);        // colour stripe (lighter)
    triangle(x + 2, y - 5, x - 4, y - 5, x - 4, y - 10);
    fill(0, 0, 100);
    ellipse(x + 6, y - 1, 5, 5);     // eye
    fill(0, 0, 0);
    ellipse(x + 6, y - 1, 2.5, 2.5);
    fill(h, s, 60);
    rect(x - 1, y - 5, 2, 10, 1);// vertical stripe detail

} if (type === 23) {// parrot green

    fill(120, 65, 75);
    ellipse(x, y + 2, 18, 22); // body
    ellipse(x, y - 10, 14, 14); // head
    ellipse(x - 3, y + 16, 9, 20); // tail
    fill(110, 70, 60);
    ellipse(x - 8, y + 4, 8, 20); // wing L

    fill(0, 0, 95);
    ellipse(x + 3, y - 11, 4, 4); // eye R
    fill(0, 0, 0);
    ellipse(x + 3, y - 11, 2, 2);

    fill(40, 90, 100);
    ellipse(x + 7, y - 7, 4, 6); // beak top
    triangle(x + 9, y - 9, x + 6, y - 5, x + 10, y - 2); // beak tip
    fill(50, 50, 95); // yellow cheek patch
    ellipse(x, y - 7, 5, 4);

} if (type === 24) {// parrot  red

    fill(0, 80, 85);
    ellipse(x, y + 2, 18, 22); // body
    ellipse(x, y - 10, 14, 14); // head
    ellipse(x - 3, y + 18, 9, 22); // tail

    fill(220, 75, 80); // blue wings
    ellipse(x - 8, y + 7, 8, 21);
    fill(50, 90, 95); // yellow wing
    ellipse(x - 8, y + 3, 8, 18);
    fill(0, 70, 70); //red wing
    ellipse(x - 8, y, 8, 16);

    fill(10, 20, 85); // yellow cheek patch
    ellipse(x + 3, y - 8, 7, 7);

    fill(0, 0, 95);
    ellipse(x + 3, y - 11, 4, 4); // eye R
    fill(0, 0, 0);
    ellipse(x + 3, y - 11, 2, 2);

    fill(40, 90, 10);
    ellipse(x + 7, y - 7, 4, 6); // beak top
    triangle(x + 9, y - 9, x + 6, y - 5, x + 10, y - 2); // beak tip

} if (type === 25) {// iguana

    fill(120, 55, 70);
    ellipse(x, y, 30, 8);           // body
    ellipse(x + 12, y - 1, 12, 8);  // head
    triangle(x - 13, y - 2, x - 38, y, x - 12, y + 3); // tail
    stroke(120, 55, 70);
    strokeWeight(1.3);
    line(x - 29, y + 1, x - 50, y + 2);
    noStroke();

    fill(120, 50, 60);
    ellipse(x - 8, y + 3, 4, 9);    // leg L-back
    ellipse(x - 8, y + 7, 8, 2);
    stroke(120, 55, 60);
    strokeWeight(3);
    line(x + 8, y + 2, x + 12, y + 7);// leg R-back
    strokeWeight(2);
    line(x + 12, y + 7, x + 15, y + 7);
    noStroke();

    // dorsal spines
    fill(110, 60, 80);
    for (let i = -8; i <= 8; i += 4) {
        triangle(x + i, y - 4, x + i - 1, y - 8, x + i + 1, y - 4);
    }
    fill(0, 0, 0);
    ellipse(x + 14, y - 3, 2.5, 2.5); // eye
    fill(120, 40, 80);
    ellipse(x + 14, y, 3, 3);         // dewlap hint

} if (type === 26) { // blue bird 

    let h = random(150, 270);
    fill(h, 75, 85);
    ellipse(x, y, 18, 12);           // body
    ellipse(x + 7, y - 2, 12, 10);  // head
    fill(h, 80, 65);
    triangle(x - 8, y + 2, x - 8, y - 2, x - 16, y); // tail

    fill(40, 90, 100);
    triangle(x + 12, y - 5, x + 15, y - 3, x + 12, y - 1); // beak
    fill(h, 70, 55);
    ellipse(x - 1, y - 1, 13, 5);// wing stripe
    fill(0, 0, 95);
    ellipse(x + 9, y - 4, 4, 4);    // eye
    fill(0, 0, 0);
    ellipse(x + 9, y - 4, 2, 2);

} if (type === 27) {// leopard

    fill(40, 65, 85);
    rect(x, y, 32, 10, 10);           // body
    ellipse(x + 32, y - 7, 10, 8); // head
    ellipse(x + 28, y - 10, 3, 3);
    ellipse(x + 32, y - 11, 3, 3); //ears

    stroke(40, 60, 85);
    strokeWeight(7);
    line(x + 28, y, x + 30, y - 5);
    strokeWeight(3);
    line(x, y + 4, x - 20, y + 6);//tail
    strokeWeight(5);
    line(x + 2, y + 6, x, y + 14);
    line(x, y + 14, x + 2, y + 20);
    line(x + 7, y + 6, x + 8, y + 18);
    strokeWeight(6);
    line(x + 26, y + 6, x + 29, y + 18);
    noStroke();


    fill(25, 80, 35);// spots — rosette style
    ellipse(x + 25, y + 1, 5, 4);
    ellipse(x + 15, y + 2, 4, 3);
    ellipse(x + 4, y + 2, 4, 3);
    ellipse(x + 29, y + 5, 3, 3);
    ellipse(x + 12, y + 6, 4, 3);
    ellipse(x + 22, y + 8, 4, 3);
    ellipse(x + 27, y + 16, 3, 3);
    ellipse(x, y + 14, 4, 3);

    fill(0, 0, 0);
    ellipse(x + 36, y - 8, 2, 2);
    ellipse(x + 32, y - 8, 3, 2);   // eyes
    fill(10, 20, 30);
    ellipse(x + 36, y - 6, 4, 2);        // nose
    stroke(40, 30, 30);
    strokeWeight(0.5);
    line(x + 38, y - 6, x + 42, y - 5);
    line(x + 38, y - 7, x + 42, y - 8);
    noStroke();

} if (type === 28) {// toucan

    fill(0, 0, 12);
    ellipse(x - 3, y + 5, 18, 22);       // body
    ellipse(x, y - 5, 14, 14);       // head
    ellipse(x - 7, y + 15, 8, 14);       // tail
    fill(20, 0, 20);
    ellipse(x + 2, y + 14, 3, 4);
    ellipse(x - 1, y + 14, 3, 4);
    fill(0, 0, 95);
    ellipse(x, y - 2, 10, 8);        // white throat
    // big beak
    fill(40, 90, 100);               // yellow top
    ellipse(x + 6, y - 5, 16, 5);
    fill(40, 80, 80);               // green mid
    ellipse(x + 6, y - 4, 16, 4);
    fill(20, 80, 60);                 // red tip
    ellipse(x + 11, y - 4, 6, 4);
    fill(0, 0, 95);
    ellipse(x - 2, y - 7, 4, 4);    // eye ring
    fill(0, 0, 0);
    ellipse(x - 2, y - 7, 2.5, 2.5);

} if (type === 29) { // poison frog 

    fill(215, 85, 80);               // blue body
    ellipse(x, y, 18, 12);
    fill(190, 80, 80);                // yellow pattern stripe
    ellipse(x - 1, y - 3, 16, 6);
    fill(215, 85, 80);
    ellipse(x + 6, y - 2, 10, 9);   // head bump
    fill(190, 80, 80);
    ellipse(x + 4, y - 5, 8, 6);
    fill(215, 90, 65);
    ellipse(x - 6, y + 4, 10, 6);    // leg L
    rect(x - 6, y + 6, 8, 2, 2);
    ellipse(x + 7, y + 5, 6, 4);    // leg R

    fill(0, 0, 95);
    ellipse(x + 8, y - 6, 4, 4);    // eye
    ellipse(x + 3, y - 6, 5, 5);
    fill(0, 0, 0);
    ellipse(x + 8, y - 6, 2, 2);
    ellipse(x + 3, y - 6, 2, 2);

}if (type === 30) {// giraffe
    let s = random(55, 80);
    let b = random(75, 95);
    fill(40, s, b);
    ellipse(x + 3, y, 18, 17);
    ellipse(x - 4, y + 2, 14, 14);        // body
    rect(x + 4, y - 25, 8, 22, 2);    // neck
    ellipse(x + 10, y - 24, 10, 8);  // head
    ellipse(x + 3, y - 24, 5, 3);        //ear
    ellipse(x - 8, y + 12, 5, 14);    // leg L
    rect(x - 9, y + 16, 2, 12)
    ellipse(x + 5, y + 12, 4, 14);    // leg R
    ellipse(x + 11, y + 9, 4, 14);
    rect(x + 11, y + 14, 2, 12)
    rect(x + 5, y + 16, 2, 12)

    fill(35, 70, 55);                // patches
    ellipse(x + 7, y - 12, 6, 5);
    ellipse(x + 9, y - 18, 4, 3);
    ellipse(x + 3, y - 3, 5, 3);
    ellipse(x - 5, y + 2, 6, 5);
    ellipse(x + 7, y + 3, 5, 4);

    fill(35, 70, 65);// ossicones
    rect(x + 8, y - 32, 2, 5, 1);
    rect(x + 5, y - 31, 2, 6, 1);
    ellipse(x + 4, y - 23, 5, 3);//ear
    fill(0, 0, 0);
    ellipse(x + 11, y - 25, 3, 2.5); // eye

}if (type === 31) {// camel 

    fill(35, 40, 65);// legs
    rect(x - 18, y + 8, 4, 19, 3);
    rect(x - 12, y + 10, 4, 21, 3);
    rect(x + 12, y + 14, 4, 17, 3);
    rect(x + 10, y + 7, 5, 9, 3);
    rect(x + 5, y + 8, 4, 21, 3);

    fill(35, 50, 75);
    // ellipse(x, y + 2, 36, 18);       // body
    rect(x - 20, y - 6, 34, 18, 10);
    ellipse(x - 5, y - 6, 14, 12); // humps
    ellipse(x + 7, y - 4, 12, 10);
    rect(x - 21, y - 16, 7, 16, 4)// neck ;
    ellipse(x - 23, y - 14, 13, 8);// head

    fill(0, 0, 0);
    ellipse(x - 24, y - 15, 2, 3); // eye
    fill(35, 30, 60);
    ellipse(x - 29, y - 12, 4, 5);    // nostril
    fill(35, 30, 50);
    ellipse(x - 18, y - 18, 3, 4);//ear

}if (type === 32) {// jerboa

    fill(35, 30, 65);
    ellipse(x + 2, y + 6, 4, 12);//leg

    stroke(35, 25, 65);
    strokeWeight(2);
    line(x - 5, y + 12, x + 5, y + 14);
    line(x + 2, y + 11, x + 8, y + 12);
    noStroke();
    fill(35, 30, 72);
    ellipse(x, y, 16, 12); // body
    ellipse(x + 7, y - 1, 10, 10); // head

    // huge ears
    fill(30, 20, 80);
    ellipse(x + 4, y - 8, 4, 10);
    ellipse(x + 9, y - 8, 4, 10);
    fill(10, 30, 95);
    ellipse(x + 4, y - 8, 2, 7); // inner ear
    ellipse(x + 9, y - 8, 2, 7);
    // long hind legs
    fill(35, 30, 65);
    ellipse(x - 4, y + 8, 4, 12);

    // front paw
    ellipse(x + 6, y + 5, 3, 5);
    // long tail
    //line(x - 7, y + 2, x - 20, y + 12); // drawn with stroke
    stroke(35, 25, 55);
    strokeWeight(1.5);
    line(x - 7, y + 2, x - 24, y + 14);
    noStroke();
    fill(10, 10, 80);
    ellipse(x - 27, y + 14, 8, 3); // tail tuft

    fill(0, 0, 0);
    ellipse(x + 9, y - 3, 2.5, 2.5); // eye
    fill(10, 30, 90);
    ellipse(x + 12, y + 1, 3, 2); // nose

}if (type === 33) {// horse

    fill(25, 50, 45); // legs
    ellipse(x - 3, y + 10, 7, 12);
    rect(x - 5, y + 15, 4, 10, 5);
    ellipse(x + 9, y + 10, 5, 12);
    rect(x + 8, y + 11, 4, 12, 5);

    fill(25, 55, 50);
    rect(x - 16, y - 9, 32, 18, 8); // body
    //fill(25, 55, 40);//
    rect(x + 12, y - 16, 8, 20, 5);
    ellipse(x + 19, y - 19, 14, 10); // head
    rect(x + 20, y - 20, 12, 6, 4);
    ellipse(x + 20, y - 17, 10, 8);

    ellipse(x - 10, y + 10, 8, 12); //legs
    rect(x - 12, y + 15, 4, 12, 5);
    ellipse(x + 16, y + 8, 6, 15);
    rect(x + 14, y + 13, 4, 13, 5);

    fill(25, 60, 45);
    ellipse(x + 13, y - 15, 5, 20); // mane
    ellipse(x + 9, y - 7, 9, 7);
    rect(x + 17, y - 28, 3, 5, 4); //ears
    rect(x + 14, y - 28, 3, 7, 4);
    ellipse(x + 31, y - 17, 4, 5); // nostril
    ellipse(x - 16, y, 8, 14); // tail
    triangle(x - 12, y, x - 20, y + 1, x - 18, y + 15);

    fill(0, 0, 0);
    ellipse(x + 21, y - 19, 3, 2); // eye
    // fill(25, 30, 40);

}if (type === 34) {// snake 

    stroke(115, 55, 55);
    strokeWeight(5);
    line(x + 15, y - 2, x - 6, y - 1);
    line(x - 6, y - 1, x - 15, y + 6);
    line(x - 15, y + 6, x - 25, y + 6);
    line(x - 25, y + 6, x - 39, y + 2);
    strokeWeight(4);
    line(x - 40, y + 2, x - 55, y + 3);
    noStroke();

    // head
    fill(115, 50, 60);
    ellipse(x + 16, y - 3, 10, 7);
    // tongue
    stroke(0, 90, 70);
    strokeWeight(1);
    line(x + 21, y - 2, x + 27, y - 1);
    line(x + 27, y - 1, x + 30, y - 3);
    line(x + 27, y - 1, x + 30, y + 1);
    noStroke();
    fill(0, 0, 0);
    ellipse(x + 17, y - 5, 2.5, 2.5); // eye

}if (type === 35) { // scorpion

    fill(40, 55, 55);
    ellipse(x, y, 20, 10);           // cephalothorax
    fill(40, 50, 45);
    ellipse(x - 10, y, 12, 8);       // abdomen
    // tail segments curling up
    ellipse(x - 18, y - 2, 7, 8);
    ellipse(x - 22, y - 8, 6, 8);
    ellipse(x - 20, y - 14, 5, 7);
    // stinger
    fill(0, 60, 60);
    ellipse(x - 19, y - 18, 5, 4);
    triangle(x - 19, y - 20, x - 17, y - 28, x - 21, y - 20);
    // claws
    fill(40, 50, 50);
    ellipse(x + 14, y - 4, 10, 5);
    ellipse(x + 13, y + 4, 12, 5);
    fill(40, 45, 40);
    triangle(x + 16, y - 2, x + 22, y - 8, x + 17, y - 6);
    triangle(x + 15, y - 4, x + 24, y - 5, x + 17, y);
    triangle(x + 17, y + 4, x + 23, y - 2, x + 18, y);
    triangle(x + 16, y + 2, x + 26, y + 6, x + 18, y + 7);


    stroke(40, 45, 40);
    strokeWeight(2);
    for (let i = -2; i <= 2; i++) {// legs 
        if (i !== 0) {
            //line(x + i * 2, y - 5, x + i * 3, y - 11);
            line(x + i * 2, y + 5, x + i * 3, y + 11);
        }
    }
    noStroke();
    //fill(0, 0, 0);
    // ellipse(x + 6, y - 3, 2, 2);    // eyes
    // ellipse(x + 6, y + 3, 2, 2);

}if (type === 36) { // meerkat (suricata)

    // tail
    fill(30, 35, 55);
    rect(x - 6, y + 8, 3, 14, 2);//tail
    ellipse(x - 8, y + 22, 7, 2);

    fill(30, 30, 60);
    ellipse(x - 3, y + 18, 3, 14);//legs
    ellipse(x + 3, y + 18, 4, 14);
    ellipse(x + 7, y + 6, 3, 12);//arm

    fill(30, 30, 72);
    ellipse(x, y + 5, 14, 20);       // body

    fill(30, 15, 85);
    ellipse(x, y + 6, 8, 14); // belly patch

    fill(30, 30, 68);
    ellipse(x, y - 8, 12, 12);// head

    fill(30, 25, 50);// ears
    ellipse(x - 6, y - 11, 3, 4);
    ellipse(x + 6, y - 11, 3, 4);

    fill(0, 0, 20); // eye mask (dark)
    ellipse(x - 3, y - 9, 4, 4);
    ellipse(x + 3, y - 9, 4, 4);
    fill(0, 0, 95);
    ellipse(x - 3, y - 9, 2.5, 2.5);
    ellipse(x + 3, y - 9, 2.5, 2.5);
    fill(0, 0, 0);
    ellipse(x - 3, y - 9, 1.5, 1.5);
    ellipse(x + 3, y - 9, 1.5, 1.5);

    fill(0, 0, 25);// nose
    ellipse(x, y - 6, 3, 2);

    fill(30, 30, 60);// arms out to sides
    ellipse(x - 6, y + 5, 2, 12);
    ellipse(x - 3, y + 10, 7, 2);
    ellipse(x + 4, y + 11, 4, 2);





} if (type === 37) {// fennec fox

    fill(35, 40, 90);
    ellipse(x, y, 24, 14);           // body
    ellipse(x + 10, y - 2, 12, 10); // head
    ellipse(x + 10, y + 6, 2, 10);
    ellipse(x + 6, y + 6, 2, 10);
    ellipse(x - 4, y + 5, 2, 10);
    ellipse(x - 8, y + 6, 2, 10);
    // HUGE ears
    fill(35, 35, 85);
    ellipse(x + 5, y - 14, 8, 18);
    ellipse(x + 14, y - 14, 8, 18);
    fill(10, 30, 100);               // inner ear
    ellipse(x + 5, y - 14, 4, 12);
    ellipse(x + 14, y - 14, 4, 12);


    fill(10, 30, 45);
    ellipse(x + 2, y + 6, 7, 6);   // tail tip 

    fill(10, 50, 65);
    ellipse(x - 1, y + 5, 7, 6);   // tail tip 

    fill(35, 35, 80);//tail
    ellipse(x - 8, y + 4, 16, 7);
    ellipse(x - 12, y + 1, 9, 8);


    fill(0, 0, 0);
    ellipse(x + 10, y - 3, 3, 2);   // eye
    ellipse(x + 14, y - 3, 3, 2);
    fill(0, 0, 20);
    ellipse(x + 13, y, 2, 2);        // nose
    stroke(35, 30, 65);
    strokeWeight(0.7);
    line(x + 15, y - 1, x + 21, y - 1);
    line(x + 15, y + 1, x + 21, y + 2);
    noStroke();

} if (type === 38) { // spider

    fill(270, 55, 32);
    ellipse(x - 10, y, 24, 18);      // abdomen
    fill(270, 48, 40);
    ellipse(x + 6, y + 3, 14, 10);   // cephalothorax
    fill(270, 55, 32);
    ellipse(x + 13, y + 5, 3, 6);    // fang
    // 4 legs down from body
    stroke(0, 0, 10);
    strokeWeight(1.5);
    line(x - 5, y + 1, x - 18, y + 14);
    line(x - 3, y + 5, x - 6, y + 16);
    line(x + 1, y + 3, x + 6, y + 16);
    line(x + 4, y + 4, x + 12, y + 14);
    noStroke();

} if (type === 39) { // mosquito

    fill(210, 30, 96, 30);
    ellipse(x - 12, y, 36, 10);// wing

    // abdomen
    fill(85, 45, 40);
    ellipse(x - 10, y + 1, 22, 10);
    // thorax
    fill(85, 42, 46);
    ellipse(x + 2, y - 2, 12, 12);
    // head
    fill(85, 40, 40);
    ellipse(x + 10, y - 3, 10, 10);
    // proboscis
    stroke(85, 40, 28);
    strokeWeight(1.2);
    line(x + 14, y, x + 26, y + 6);
    noStroke();
    fill(210, 30, 96, 30);
    ellipse(x - 10, y - 5, 36, 10);// wing
    // antenna
    stroke(85, 35, 40);
    strokeWeight(1);
    line(x + 10, y - 7, x + 8, y - 16);
    line(x + 8, y - 16, x + 4, y - 21);
    noStroke();
    // 3 legs
    stroke(85, 35, 45);
    strokeWeight(1.2);
    line(x - 4, y + 3, x - 14, y + 14);
    line(x + 2, y + 4, x + 2, y + 16);
    line(x + 7, y + 3, x + 16, y + 12);
    noStroke();

} if (type === 40) {  // ant }
    pop();
}