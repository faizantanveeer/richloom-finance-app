import HeroSection from "@/components/Hero";
import { Card, CardContent } from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div className="mt-30">
      <HeroSection />

      {/* Stats Section */}
      <section className=" bg-green-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {statsData.map((stat, index) => (
              <div key={index} className="relative text-center px-4">
                <div className="text-4xl font-bold mb-2 text-green-600">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 ">All you need to manage your Finances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresData.map((feature, index) => (
              <Card className="p-6 cursor-pointer hover:shadow-md" key={index}>
                <CardContent className="space-y-4 pt-4">
                  {feature.icon}
                  <h3 className="text-green-600 font-bold text-2xl">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* How It Works Section */}

      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 ">How Richloom works?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorksData.map((step, index) => (
              <div key={index} className="items-center text-center p-6  flex flex-col gap-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex justify-center items-center">{step.icon}</div>
                <h3 className="text-green-600 font-bold text-2xl">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 ">What our users say about Richloom?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsData.map((testimonial, index) => (
              <Card className="p-6 cursor-pointer hover:shadow-md" key={index}>
                <CardContent className="space-y-4 pt-4">
                  
                    <div className="flex items-center gap-4">

                    <Image src={testimonial.image}
                    alt={testimonial.name}
                    width={40}
                    className={"rounded-full "}
                    height={40}/>

                    <div>
                      <h3 className="text-green-600 font-seibold text-2xl">{testimonial.name}</h3>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                    </div>
                    
                    <p className="mt-2">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


{      /* CTA Section */}
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to take control of your finances?</h2>
          <p className="text-gray-600 mb-8">Join thousands of users who trust Richloom to manage their finances.</p>
          <Link href="/dashboard">
          <Button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300">Take a Free Trial</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
