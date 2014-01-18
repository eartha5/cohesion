cohesion
========

An unscientific attempt at simulating molecule cohesion in fluid blob interaction


Idea here is to kind of create a pixel manipulation in canvas that will sort of behave like a lava lamp.



CODE STRUCTURE 

is a bare-bones architecture to focus on canvas manipulations.



DEPENDENCIES

are not managed but inline and are:

jquery
modernizr (is just here for kicks really)


I'm using LiveReload server to preprocess LESS, LiveReload chrome extension to auto-reload code changes





NOTES:

1-8-13
Found a neat way to simulate cohesion without processing every pixel as a fluid molecule using gradients.
Adopted the concept from this guy:
http://www.somethinghitme.com/2012/06/06/2d-metaballs-with-canvas/

looking at simulating lavalamp behavior now with this overlapping gradient effect, next iterations will dig in