import Navigation from "@/components/ui/navigation";
import Mission from "@/components/Mission";
import Footer from "@/components/Footer";

const MissionPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <Mission />
      </div>
      <Footer />
    </div>
  );
};

export default MissionPage;