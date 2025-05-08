import MESSAGE_ICON from "@/assets/message.svg";
import Image from "next/image";
function AboutUs() {
  return (
    <div
      id="about"
      className="flex poppins gap-4 flex-col lg:flex-row justify-between mx-6 md:mx-8 lg:mx-20 pt-14 pb-40"
    >
      <section className="flex flex-col lg:w-1/2 xl:w-[55%]">
        <header className="text-[32px] font-medium">About Us</header>
        <main className="text-sm md:text-base leading-8  text-[#585858]">
          We&apos;re building a modern investment platform that puts simplicity,
          transparency, and accessibility at the core. Whether you&apos;re investing
          in treasury bills, government bonds, or tokenized equity — we make it
          seamless, secure, and accessible to everyone. Our mission is to give
          individuals more control over how they grow their money — with the
          choice to invest using a wallet or card, and the clarity to know
          exactly where their funds go. Real assets. Real returns. Your choice.
        </main>
      </section>

      <section className="flex flex-col lg:w-[40%]">
        <header className="text-[32px] font-medium mb-2">Contact us </header>
        <main className="mb-4">Have questions? We\’re happy to chat.</main>
        <div>
          <span className="text-[#1E3D34] flex items-center gap-2 font-medium">
            <Image src={MESSAGE_ICON} alt="message" />
            Email : adamsinvestment.com
          </span>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
