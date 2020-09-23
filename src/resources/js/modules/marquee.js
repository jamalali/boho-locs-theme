export class Marquee {

    constructor(container) {
        this.container  = container;
        this.content    = container.querySelector('.marquee__content');

        this.isPaused = false;

        this.resizeTimer = null;
        this.scrollTimer = null;

        this.init();

        window.addEventListener('resize', () => {

            clearTimeout(this.resizeTimer);

            this.resizeTimer = setTimeout(() =>  {

                clearTimeout(this.scrollTimer);
                this.init();
                        
            }, 1000);

        });
    }

    init() {

        let containerWidth = this.container.offsetWidth;
        let contentWidth = this.content.offsetWidth;

        const item = this.content.querySelector('.marquee__list-item');
        let clonedItem;

        while (contentWidth < containerWidth) {
            clonedItem = item.cloneNode(true); // Clone the marquee item
            this.content.prepend(clonedItem); // Add it to the beginning

            contentWidth = this.content.offsetWidth; // Update width value
        }

        // Clone an extra one so we do not get a gap at the end when it is scrolling
        clonedItem = item.cloneNode(true);
        this.content.prepend(clonedItem);

        this.scroll();
    }

    scroll() {

        let rightSideOfContainer = this.container.getBoundingClientRect().right;
        let currentRightValue = 0;

        this.scrollTimer = setInterval(() => {

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

                if (leftSideOfLastItem >= rightSideOfContainer){
                    currentRightValue = -1;
                    this.content.prepend(lastItem);
                }

                // The part that keeps it all going: animating the right value of the list.
                this.content.style.right = `${currentRightValue}px`;
                currentRightValue--;
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