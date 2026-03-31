import darkLogo from './darkLogo.webp';
import logo from './logo.webp';
import heroImg from './heroImg.webp';
import contactUs from './contactUs.webp';
import menuIcon from './menuIcon.svg';
import closeMenu from './closeMenu.svg';
import dummyUserImg from './dummyUserImg.webp';
import liveAuctions from './liveAuctions.webp';
import soldAuctions from './soldAuctions.webp';
import endingSoonAuctions from './endingSoonAuctions.webp';
import upcomingAuctions from './upcomingAuctions.webp';
import about from './about.webp';
import about2 from './about2.webp';
import spinner from './spinner.png';

function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}
// (202) 555-0125

const otherData = {
    phone: '5551234567',
    phoneCode: '+1',
    email: 'tech@jltmselect.com',
    address: '123 Luxury Lane, New York, NY 10001',
    brandName: 'JLTM',
    formatPhone,
    hours: [
        {days: 'Mon–Sat', time: '10am – 7pm'},
        {days: 'Sun', time: '12pm – 5pm'},
    ]
}

export {
    otherData,
    about,
    about2,
    darkLogo,
    logo,
    heroImg,
    menuIcon,
    closeMenu,
    contactUs,
    dummyUserImg,
    liveAuctions,
    soldAuctions,
    endingSoonAuctions,
    upcomingAuctions,
    spinner,
};