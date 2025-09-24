import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Users, MessageCircle, Shield, Zap } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-gradient-hero text-white rounded-2xl p-12 shadow-glow">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Our Platform
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Created by Rehan and Company, established in 2095, we're building the future of 
              anonymous knowledge sharing and community-driven learning.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
          <Card className="p-8 shadow-elegant text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe that everyone has valuable knowledge to share and important questions to ask. 
              Our platform removes barriers by allowing completely anonymous participation, 
              creating a safe space where curiosity can flourish without judgment.
            </p>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 shadow-card hover:shadow-elegant transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-primary p-3 rounded-lg mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Anonymous & Safe</h3>
            </div>
            <p className="text-muted-foreground">
              No registration required. Ask questions and share knowledge without revealing your identity. 
              Your privacy is our priority.
            </p>
          </Card>

          <Card className="p-8 shadow-card hover:shadow-elegant transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-primary p-3 rounded-lg mr-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Rich Discussions</h3>
            </div>
            <p className="text-muted-foreground">
              Engage in meaningful conversations with nested replies, helpful voting, 
              and content sharing across various topics.
            </p>
          </Card>

          <Card className="p-8 shadow-card hover:shadow-elegant transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-primary p-3 rounded-lg mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Community Driven</h3>
            </div>
            <p className="text-muted-foreground">
              Built by the community, for the community. Every voice matters and 
              contributes to our collective knowledge base.
            </p>
          </Card>

          <Card className="p-8 shadow-card hover:shadow-elegant transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-primary p-3 rounded-lg mr-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Instant Access</h3>
            </div>
            <p className="text-muted-foreground">
              Jump right in without any signup process. Start asking, answering, 
              and learning immediately.
            </p>
          </Card>
        </div>

        {/* Company Info */}
        <Card className="p-8 shadow-elegant text-center bg-gradient-card">
          <h2 className="text-2xl font-bold mb-4">Rehan and Company</h2>
          <p className="text-muted-foreground text-lg mb-4">
            Established in 2095
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We're passionate about creating platforms that empower people to learn, share, 
            and grow together. Our commitment to privacy, accessibility, and community-driven 
            content makes us unique in the digital landscape.
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default About;