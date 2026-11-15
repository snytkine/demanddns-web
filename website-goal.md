create a modern web application that uses react.js, three.js and utilized modern HTML 5 features. Website must render well in browser as well as in mobile devices.

The goal of the website is to promote this new project. The project is called "Command DNS" which is an app for locally hosted DNS server. 

Design should use light background color, lots of white space. The main color scheme will be light and dark blue with some elements of silver color. It will use gradients and a "Glass" visual effect of some elements. 

The layout and overall design of this website should resemble a modern MacOS desktop application. 

The backgound will have some images that showcase technology, with enphasys on Internet, Local Network Setup, simulation of network diagrams that has workstations, servers, router and Internet. The DNS server sits on a local network segment. 
This background image will be non-obtrusive, and will be used to create a sense of immersion but will not be distracting. Network devices should be represented by commonly used icons that similar to the once that used by cloud providers like AWS, Google Cloud, etc. 
The website will have a header with the project name "Command DNS" and a navigation menu with items:
- Home
- Features
- Documentation
- Download

The navigation items will also have graphical icons next to them. The icons will be in modern design and have effect of 3D with minimal animation on mouseover. The icons will have an effect of "Glass" visual effect with light reflection. 

The transition between pages should have a smooth transition animation effect. 

Create a new React.js project using Vite. Must use typescript with strong types. Website must be easy to maintain and to update the content. The content of individual pages should be stored as markdown files. The website must have a footer with copyright information and a current year which will be set dynamically in the format "Copyright © 2026 - [current year] Command DNS" If current year is 2026 then only should be displayed as "Copyright © 2026 Command DNS".

The home page should include 3 blocks - Features, How it works, and Download. Each block should be a card with an icon, title.

There should be an animated element on the home page, taking approximately 1/3 the width of the page, created with three.js that will show a network with several servers and workstations, all connected to DNS server and showing green dots moving to and from DNS server from each workstation/server, indicating the traffic. The speed of movement of these dots should be stored in configuration file. The DNS server should have a network connection to the world, showing a globe icon. Another greet dot should be representing a traffic moving to and from the DNS server to the Internet but this traffic should be less frequent than the traffic between the DNS server and the workstations/servers. This part of animation speed shuld also be configurable from the settings.

The animation should be looping "N" seconds before stopping where "N" is stored in the configuration and defaults to 10 seconds. The animation should be able to be paused and resumed by clicking on it.

The website should have a "Light/Dark" mode switch visible on the top right corner of the page. The switch should be able to toggle between light and dark mode and the switch should be in a form of toggle commonly used in MacOS applications.


