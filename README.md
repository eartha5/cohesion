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