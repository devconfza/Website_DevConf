export default () => {
    const sponsorBlock = document.getElementsByClassName('sponsor-content-detail-wide-body')[0];
    if (!sponsorBlock) {
        return
    }

    let sponsorPosition = 0

    setInterval(() => {
        sponsorPosition += 0.25
        if (sponsorPosition > sponsorBlock.scrollWidth) {
            sponsorPosition = 0
        }
        
        sponsorBlock.scrollTo(sponsorPosition, 0);
    }, 10)
}
