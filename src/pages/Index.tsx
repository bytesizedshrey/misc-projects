
import Layout from "../components/Layout";
import HomepageHeroSection from "../components/HomepageHeroSection";
import HomepageFeaturesSection from "../components/HomepageFeaturesSection";
import HomepageLearningSection from "../components/HomepageLearningSection";
import HomepageCallToActionSection from "../components/HomepageCallToActionSection";

const Index = () => {
  return (
    <Layout>
      <HomepageHeroSection />
      <HomepageFeaturesSection />
      <HomepageLearningSection />
      <HomepageCallToActionSection />
    </Layout>
  );
};

export default Index;
