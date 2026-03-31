import { Quote } from "lucide-react";
import { dummyUserImg } from "../assets";

function TestimonialCard({ name, position, review, image, date }) {
    return (
        <div className='bg-gradient-to-b from-secondary/[0.03] to-transparent dark:from-white/[0.03] dark:to-transparent text-text-primary dark:text-text-primary-dark border border-gray-200 dark:border-bg-primary-light rounded-2xl p-6 h-full flex flex-col'>
            {/* Rating and Date */}
            <div className='flex items-start justify-between mb-2'>
                <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="lucide lucide-star text-transparent fill-[#FF8F20]" aria-hidden="true">
                            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                        </svg>
                    ))}
                </div>
                <p className='text-xs text-text-secondary dark:text-text-secondary-dark'>{date || "Jun 10, 2025"}</p>
            </div>

            {/* Review Text - flex-1 makes it take available space */}
            <p className='text-sm/6 text-text-primary dark:text-text-primary-dark flex-1'>"{review}"</p>

            {/* User Info - stays at bottom */}
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-4 mt-4'>
                    <img
                        src={dummyUserImg}
                        alt={name}
                        className='w-12 h-12 rounded-full object-cover'
                    />
                    <div>
                        <p className='text-sm text-text-primary dark:text-text-primary-dark'>{name}</p>
                        <p className='text-xs text-text-secondary dark:text-text-secondary-dark'>{position}</p>
                    </div>
                </div>

                {/* <Quote size={50} className="text-text-secondary dark:text-text-secondary-dark" /> */}
            </div>
        </div>
    );
}

export default TestimonialCard;