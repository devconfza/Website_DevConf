export default () => {
    const row1 = document.querySelector('.sponsor-row-1');
    const row2 = document.querySelector('.sponsor-row-2');
    const row3 = document.querySelector('.sponsor-row-3');
    
    if (!row1 || !row2 || !row3) {
        return
    }
    
    let sponsorPosition1 = 0
    let sponsorPosition2 = 0
    let sponsorPosition3 = 0
    
    // Initialize row2 scroll position to start from the right
    sponsorPosition2 = row2.scrollWidth - row2.clientWidth
    
    // Consistent scroll speed for all rows
    const SCROLL_SPEED = 0.35
    const INTERVAL = 16 // ~60fps
    
    // Safety function to validate scroll positions
    const validateScrollPos = (pos, min, max) => {
        if (isNaN(pos)) return min
        return Math.max(min, Math.min(max, pos))
    }
    
    // Top row scrolls left using requestAnimationFrame for smoother animation
    let lastTimestamp1
    const animateRow1 = (timestamp) => {
        if (!lastTimestamp1) lastTimestamp1 = timestamp
        const elapsed = timestamp - lastTimestamp1
        
        if (elapsed >= INTERVAL) {
            sponsorPosition1 += SCROLL_SPEED
            
            // Reset position when we reach the end, with bounds checking
            const maxScroll = Math.max(0, row1.scrollWidth - row1.clientWidth)
            if (sponsorPosition1 > maxScroll) {
                sponsorPosition1 = 0
            }
            
            // Validate position before scrolling
            sponsorPosition1 = validateScrollPos(sponsorPosition1, 0, maxScroll)
            
            row1.scrollTo({
                left: sponsorPosition1,
                top: 0,
                behavior: 'auto'
            })
            
            lastTimestamp1 = timestamp
        }
        
        requestAnimationFrame(animateRow1)
    }
    requestAnimationFrame(animateRow1)
    
    // Middle row scrolls right using requestAnimationFrame
    let lastTimestamp2
    const animateRow2 = (timestamp) => {
        if (!lastTimestamp2) lastTimestamp2 = timestamp
        const elapsed = timestamp - lastTimestamp2
        
        if (elapsed >= INTERVAL) {
            sponsorPosition2 -= SCROLL_SPEED
            
            // Reset position when we reach the beginning, with bounds checking
            const maxScroll = Math.max(0, row2.scrollWidth - row2.clientWidth)
            if (sponsorPosition2 < 0) {
                sponsorPosition2 = maxScroll
            }
            
            // Validate position before scrolling
            sponsorPosition2 = validateScrollPos(sponsorPosition2, 0, maxScroll)
            
            row2.scrollTo({
                left: sponsorPosition2,
                top: 0,
                behavior: 'auto'
            })
            
            lastTimestamp2 = timestamp
        }
        
        requestAnimationFrame(animateRow2)
    }
    requestAnimationFrame(animateRow2)
    
    // Bottom row scrolls left with 200ms delay
    setTimeout(() => {
        let lastTimestamp3
        const animateRow3 = (timestamp) => {
            if (!lastTimestamp3) lastTimestamp3 = timestamp
            const elapsed = timestamp - lastTimestamp3
            
            if (elapsed >= INTERVAL) {
                sponsorPosition3 += SCROLL_SPEED
                
                // Reset position when we reach the end, with bounds checking
                const maxScroll = Math.max(0, row3.scrollWidth - row3.clientWidth)
                if (sponsorPosition3 > maxScroll) {
                    sponsorPosition3 = 0
                }
                
                // Validate position before scrolling
                sponsorPosition3 = validateScrollPos(sponsorPosition3, 0, maxScroll)
                
                row3.scrollTo({
                    left: sponsorPosition3,
                    top: 0,
                    behavior: 'auto'
                })
                
                lastTimestamp3 = timestamp
            }
            
            requestAnimationFrame(animateRow3)
        }
        requestAnimationFrame(animateRow3)
    }, 200)
}
