cohesion
========

An unscientific attempt at simulating molecule cohesion in fluid blob interaction


Idea here is to push some pixels in canvas that will sort of behave like a lava lamp.



modernizr (is just here for kicks)




NOTES:

1-8-13
Found a neat way to simulate cohesion without processing every pixel as a fluid molecule, by using gradients and rendering overlapping pixels at a threshold:
http://www.somethinghitme.com/2012/06/06/2d-metaballs-with-canvas/





1-21-14
Need to refactor dramatically, modularize and decrease complexity of functions





1-29-14  OPTIMIZATIONS TO TRY:

move the points array position calculations to a web worker that reports cycles on 5ms

move the drawing of the gradients from the points array into another chained web worker that cycles on 10ms

move the Filter application to yet a third thread that pulls the data from thread 2, manipulates and reports it to the update function, every 15ms

on update, every 20ms
grab the pixel data array from the drawing web worker to copy to the animationCanvas without manipulation, so just a straight copyData or whatever, no manual loop

will this work somehow?



Thinning Data Display

try iterating the loops over pixel data to skip every 4 rgba pixels in both x and y (introduce transparency and push the white toward gray in the 2-color art—but while 1/16th the iterations on loops

guessing they’re doing the above at okfoc.us  to get usable framerates on their full-screen 3D rendering