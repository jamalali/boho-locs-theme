export class Marquee {

    constructor(container) {
        this.container  = container;
        this.content    = container.querySelector('.marquee__content');

        this.rightSideOfContainer = container.getBoundingClientRect().right;

        this.currentRightValue = 0;
        this.isPaused = false;
    }

    init() {

        setInterval(() => {

            if (this.isPaused == false) {


                /*
                Because we are going left-to-right (text is aligned right) we look at last item in the list and 
                check if it goes out of the visible area.
                We do this by comparing the left position of the last list item to the right position of the containing element.
                */

                const lastItem = this.content.querySelector('.marquee__list-item:last-child');

                let leftSideOfLastItem = lastItem.getBoundingClientRect().left;

                /*
                If last list item is out of viewable area, move it to the beginning of the list. 
                Also, set the current right value to -1 so we won't stutter 
                */

                if (leftSideOfLastItem >= this.rightSideOfContainer){
                    this.currentRightValue = -1;
                    this.content.prepend(lastItem);
                }

                // The part that keeps it all going: animating the right value of the list.
                this.content.style.right = `${this.currentRightValue}px`;
                this.currentRightValue--;
            }

        }, 30);

        // Setup hover events to pause
        this.container.addEventListener("mouseenter", event => {
            this.isPaused = true;
        });

        this.container.addEventListener("mouseleave", event => {   
            this.isPaused = false;
        });
    }
}