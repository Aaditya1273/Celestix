import { useState } from "react";
import { CodeTab, PreviewTab, CliTab, TabbedLayout } from "../../components/common/TabbedLayout";
import { Box, Button } from "@chakra-ui/react";

import Customize from "../../components/common/Preview/Customize";
import CodeExample from "../../components/code/CodeExample";
import CliInstallation from "../../components/code/CliInstallation";
import PropTable from "../../components/common/Preview/PropTable";
import useForceRerender from "../../hooks/useForceRerender";
import PreviewSwitch from "../../components/common/Preview/PreviewSwitch";

import { profileCard } from "../../constants/code/Components/profileCardCode";
import ProfileCard from "../../content/Components/ProfileCard/ProfileCard";

const ProfileCardDemo = () => {
  const [showIcon, setShowIcon] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [showBehindGradient, setShowBehindGradient] = useState(true);
  const [customBehindGradient, setCustomBehindGradient] = useState("radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(30,100%,90%,var(--card-opacity)) 4%,hsla(30,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(30,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(30,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#FFA500c4 0%,#FFC10700 100%),radial-gradient(100% 100% at 50% 50%,#FFC107ff 1%,#FF8C0000 76%),conic-gradient(from 124deg at 50% 50%,#FF8C00ff 0%,#FFC107ff 40%,#FFC107ff 60%,#FF8C00ff 100%)");
  const [customInnerGradient, setCustomInnerGradient] = useState("linear-gradient(145deg,hsla(30, 40%, 45%, 0.55) 0%,hsla(45, 60%, 70%, 0.27) 100%)");

  const [key, forceRerender] = useForceRerender()

  const generateRandomGradients = () => {
    const randomHue1 = Math.floor(Math.random() * 60);
    const randomHue2 = Math.floor(Math.random() * 60);
    const randomHue3 = Math.floor(Math.random() * 60);
    const randomHue4 = Math.floor(Math.random() * 60);

    const newBehindGradient = `radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(${randomHue1},100%,90%,var(--card-opacity)) 4%,hsla(${randomHue1},50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(${randomHue1},25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(${randomHue1},0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,hsl(${randomHue2}, 100%, 70%) 0%,transparent 100%),radial-gradient(100% 100% at 50% 50%,hsl(${randomHue3}, 100%, 65%) 1%,transparent 76%),conic-gradient(from 124deg at 50% 50%,hsl(${randomHue4}, 100%, 70%) 0%,hsl(${randomHue2}, 100%, 70%) 40%,hsl(${randomHue2}, 100%, 70%) 60%,hsl(${randomHue4}, 100%, 70%) 100%)`;
    const newInnerGradient = `linear-gradient(145deg,hsla(${randomHue1}, 40%, 45%, 0.55) 0%,hsla(${randomHue3}, 60%, 70%, 0.27) 100%)`;

    setCustomBehindGradient(newBehindGradient);
    setCustomInnerGradient(newInnerGradient);
    forceRerender();
  };

  const propData = [
    {
      name: "avatarUrl",
      type: "string",
      default: '"<Placeholder for avatar URL>"',
      description: "URL for the main avatar image displayed on the card"
    },
    {
      name: "iconUrl",
      type: "string",
      default: '"<Placeholder for icon URL>"',
      description: "Optional URL for an icon pattern overlay on the card background"
    },
    {
      name: "grainUrl",
      type: "string",
      default: '"<Placeholder for grain URL>"',
      description: "Optional URL for a grain texture overlay effect"
    },
    {
      name: "behindGradient",
      type: "string",
      default: "undefined",
      description: "Custom CSS gradient string for the background gradient effect"
    },
    {
      name: "innerGradient",
      type: "string",
      default: "undefined",
      description: "Custom CSS gradient string for the inner card gradient"
    },
    {
      name: "showBehindGradient",
      type: "boolean",
      default: "true",
      description: "Whether to display the background gradient effect"
    },
    {
      name: "className",
      type: "string",
      default: '""',
      description: "Additional CSS classes to apply to the card wrapper"
    },
    {
      name: "enableTilt",
      type: "boolean",
      default: "true",
      description: "Enable or disable the 3D tilt effect on mouse hover"
    },
    {
      name: "miniAvatarUrl",
      type: "string",
      default: "undefined",
      description: "Optional URL for a smaller avatar in the user info section"
    },
    {
      name: "name",
      type: "string",
      default: '"Javi A. Torres"',
      description: "User's display name"
    },
    {
      name: "title",
      type: "string",
      default: '"Software Engineer"',
      description: "User's job title or role"
    },
    {
      name: "handle",
      type: "string",
      default: '"javicodes"',
      description: "User's handle or username (displayed with @ prefix)"
    },
    {
      name: "status",
      type: "string",
      default: '"Online"',
      description: "User's current status"
    },
    {
      name: "contactText",
      type: "string",
      default: '"Contact"',
      description: "Text displayed on the contact button"
    },
    {
      name: "showUserInfo",
      type: "boolean",
      default: "true",
      description: "Whether to display the user information section"
    },
    {
      name: "onContactClick",
      type: "function",
      default: "undefined",
      description: "Callback function called when the contact button is clicked"
    }
  ];

  return (
    <TabbedLayout>
      <PreviewTab>
        <Box position="relative" className="demo-container" h={700} overflow="hidden" bg="#333333">
          <ProfileCard
            key={key}
            name="James Potter"
            title="SWE"
            handle="jamiepotter"
            status="Online"
            contactText="Contact Me"
            avatarUrl="/assets/person.png"
            iconUrl={showIcon ? "/assets/iconpattern.png" : ""}
            showUserInfo={showUserInfo}
            showBehindGradient={showBehindGradient}
            grainUrl="/assets/grain.webp"
            behindGradient={customBehindGradient}
            innerGradient={customInnerGradient}
          />
        </Box>        <Customize>
          <h2 className="demo-title-extra" style={{ color: '#FFA500' }}>Customize</h2>
          <Button
            onClick={generateRandomGradients}
            fontSize="xs"
            bg="#000"
            borderRadius="10px"
            border="1px solid #FFA500"
            _hover={{ bg: "#111" }}
            color="#FFA500"
            h={8}
          >
            Randomize Colors
          </Button>

          <PreviewSwitch
            title="Show Icon Pattern"
            isChecked={showIcon}
            onChange={() => {
              setShowIcon(!showIcon);
              forceRerender();
            }}
          />
          <PreviewSwitch
            title="Show User Info"
            isChecked={showUserInfo}
            onChange={() => {
              setShowUserInfo(!showUserInfo);
              forceRerender();
            }}
          />
          <PreviewSwitch
            title="Show BG Gradient"
            isChecked={showBehindGradient}
            onChange={() => {
              setShowBehindGradient(!showBehindGradient);
              forceRerender();
            }}
          />
        </Customize>

        <PropTable data={propData} />
      </PreviewTab>

      <CodeTab>
        <CodeExample codeObject={profileCard} />
      </CodeTab>

      <CliTab>
        <CliInstallation {...profileCard} />
      </CliTab>
    </TabbedLayout>
  );
};

export default ProfileCardDemo;