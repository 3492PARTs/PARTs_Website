import { Component, HostListener, OnInit } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { HeaderComponent } from '../../atoms/header/header.component';
import { ModalComponent } from '../../atoms/modal/modal.component';
import { AppSize, GeneralService } from '../../../services/general.service';
import { CommonModule } from '@angular/common';
import { BlueBannersComponent } from '../../elements/blue-banners/blue-banners.component';

@Component({
  selector: 'app-about',
  imports: [
    BoxComponent,
    HeaderComponent,
    ModalComponent,
    CommonModule,
    BlueBannersComponent,
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  bot2011ModalVisible = false;
  bot2012ModalVisible = false;
  bot2013ModalVisible = false;
  bot2014ModalVisible = false;
  bot2015ModalVisible = false;
  bot2016ModalVisible = false;
  bot2017ModalVisible = false;
  bot2018ModalVisible = false;
  bot2019ModalVisible = false;
  bot2020ModalVisible = false;
  bot2022ModalVisible = false;
  bot2023ModalVisible = false;
  bot2024ModalVisible = false;
  bot2025ModalVisible = false;

  screenSize!: AppSize;
  screenSizeSmall = AppSize.SM;

  bots: Bot[] = [
    {
      visible: false,
      title: '2025 - B.O.B.',
      img: 'https://i.imgur.com/TcV2Hjv.jpeg',
      paragraphs: [
        `"B.O.B.", named after our Software mentor Brandon Duke, was our fourteenth robot designed to play the 2025 game
          REEFSCAPE. He was designed to intake coral through its rear hopper and place it out of
          a manipulator on his elevator. He did this though the use of vision processing to align
          with the scoring target`,
        `In REEFSCAPE<SUP> SM </SUP> presented by Haas, two competing alliances are invited to score coral, harvest algae, and
          attach to the barge before time runs out. Alliances earn additional rewards for meeting specific scoring
          thresholds and for cooperating with their opponents.`,
        `During the first 15 seconds of the match, robots are autonomous. Without guidance from their drivers, robots
          leave their starting zone, score coral on the reef, harvest algae from the reef, and collect and score additional
          coral.`,
        `During the remaining 2 minutes and 15 seconds, drivers control their robots. Robots collect coral from human
          players at their coral station and score them on the reef. To unlock all scoring locations on the reef, robots
          must dislodge algae from the reef and either score it in the barge or deliver it to the human player through the
          processor.`,
        `A human player can then deliver the algae to the barge. If at least two algae are scored in the processor by
          each alliance, both alliances earn a Coopertition Point (which influences their rank in the tournament) and
          lowers the requirements for a ranking point.`,
        `As time runs out, robots prepare to return to the surface with their algae by grabbing onto their cages and
          parking under the barge.`,
        `The alliance that earns the most points wins the match!`,
        `B.O.B. competed in the 2025 Greater Regional. There we were
          ranked 22 out of 53. We went on to be selected by the 1st
          alliance consisting of teams  694 (StuyPulse) and 3539 (Byting Bulldogs). We
          competed through finals where we won the competition contributing a significant
          amount of points towards our regional ranking. We also won the "Team Sustainability Award sponsored by Dow" contributing 
          more points towards out regional ranking.`,
        `Due to the nature of how you accumulate points and are ranked in in the regional pool
          teams are invited to the World Championship. We accumulated enough points to be ranked high enough
          after competitions concluded the week we played to be invited.`,
        `B.O.B. also competed in the 2025 Smoky Mountains Regional. There we were
          ranked 23 out of 47. We went on to be selected by the 2nd
          alliance consisting of teams  4020 (Cyber Tribe) and 8570 (Binary-Bolts). We
          competed competed in the playoffs and were eliminated in the Double Elimination 
          Bracket (Round 5). Even though we did not win the regional we did win the
          Regional FIRST Impact Award which
          <em>"is the most prestigious award at FIRST, it honors the team that best 
          represents a model for other teams to emulate and best embodies the mission of 
          FIRST. It was created to keep the central focus of FIRST Robotics Competition on 
          the ultimate goal of transforming the culture in ways that will inspire greater levels of respect 
          and honor for science and technology, as well as encouraging more of today's youth to become science 
          and technology leaders."</em>
          This contributes a significant amount of points towards the regional pool rank.`,
        `At Worlds we competed in the Daly division. We finished ranking 61 out of
          75. Even though we did not win the division we did win the
          Team Sustainability Award sponsored by Dow.`
      ]
    },
    {
      visible: false,
      title: '2024 - DOC BOT',
      img: 'https://i.imgur.com/DmsQWb1.png',
      paragraphs: [
        `DOC BOT was our thirteenth robot and was named after our new head mentor
          Dr. Angela Abbott, who we refer to as "Doc" because of her PhD in
          Education.`,
        `In CRESCENDO presented by Haas, two competing alliances are invited to
          score notes, amplify their speaker, harmonize onstage, and take the
          spotlight before time runs out. Alliances earn additional rewards for
          meeting specific scoring thresholds and for cooperating with their
          opponents.`,
        `During the first 15 seconds of the match, robots are autonomous.
          Without guidance from their drivers, robots leave their starting zone,
          score notes in their speaker or amp, and collect and score additional
          notes.`,
        `During the remaining 2 minutes and 15 seconds, drivers control their
          robots. Robots collect notes from human players at their source and
          score them in their amp and speaker. Each time an alliance gets 2
          notes in their amp, the human player can amplify their speaker for 10
          seconds. Notes scored in an amplified speaker are worth more points
          than those scored in an unamplified speaker.`,
        `A human player may choose to repurpose a note scored in their amp in
          cooperation with their opponent. If each alliance repurposes a note by
          hitting their Coopertition button in the first 45 seconds of teleop,
          all teams in the match receive a Coopertition point (which influences
          their rank in the tournament), and the number of notes needed for the
          melody bonus is reduced.`,
        `As time runs out, robots race to get onstage and deliver notes to
          their traps. Harmonizing robots, i.e. robots sharing a chain, earn an
          added bonus. Robots earn even more points if a human player spotlights
          robots on a chain by scoring a note on the chain's microphone.`,
        `The alliance that earns the most points wins the match!`,
        `DOC BOT competed in two competitions, the 2024 Greater Pittsburgh
          Regional and Miami Valley Regional. At the Greater Pittsburgh Regional
          we ranked 46 out of 50 teams due to many technical difficulties from
          aging hardware. When attending the Miami Valley Regional we went with
          an overhaul of our components in the bot and ranked much higher, 22
          out of 50 teams. We were not in finals however we won the Team
          Sustainability Award sponsored by Dow. This award "Celebrates and
          recognizes a team which has developed sustainable practices to have a
          positive environmental impact and achieve long-term continuity.`
      ]
    },
    {
      visible: false,
      title: '2023 - T.I.N.A.',
      img: 'https://i.imgur.com/7KxyFlB.jpeg',
      paragraphs: [
        `"T.I.N.A." (Tank Inspired Nightmare Automaton) was our twelfth robot
          and was named after our retiring mentor Tina Kirk.`,
        `In CHARGED UP presented by Haas, two competing alliances are invited
          to process game pieces to bring energy to their community. Each
          alliance brings energy to their community by retrieving their game
          pieces from substations and scoring it into the grid. Human players
          provide the game pieces to the robots from the substations. In the
          final moments of each match, alliance robots race to dock or engage
          with their charge station! Each match begins with a 15-second
          autonomous period, during which time alliance robots operate only on
          pre-programmed instructions to score points by:`,
        `<ul>
          <li>leaving their community,</li>
          <li>retrieving and scoring game pieces onto the grid,</li>
          <li>docking on or engaging with their charge station.</li>
        </ul>`,
        `In the final 2 minutes and 15 seconds of the match, drivers take
          control of the robots and score points by:`,
        `<ul>
          <li>
            continuing to retrieve and score their game pieces onto the grid and
          </li>
          <li>docking on or engaging with their charge station.</li>
        </ul>`,
        `T.I.N.A. competed in two competitions, the 2023 Miami Valley Regional
          and Smoky Mountains Regional. At Miami Valley we were ranked 27 out of
          50. We did not go on to compete in finals. At Smoky Mountains we were
          ranked 9 out of 38. We were captains of the 6th alliance consisting of
          teams 8841 (OTTER) and 4462 (Full Metal Jackets). We lost in upper
          bracket round one and lower bracket round 2 and were eliminated.`
      ]
    },
    {
      visible: false,
      title: '2022 - Jake and Bake',
      img: 'https://i.imgur.com/e1gwE3O.jpeg',
      paragraphs: [
        `"Jake and Bake" was our eleventh robot and was named after our
          mechanical mentor Jacob Plasters. Our 2022 robot had a rear intake
          with a shooter at the front in which we could hold the maximum number
          of balls, and we had a climber for the end so that we could have our
          robot climb to the second rung.`,
        `In RAPID REACT presented by The Boeing Company, two competing
          alliances are invited to process cargo for transportation. Each
          alliance is assigned a cargo color (red or blue, based on alliance
          affiliation) to process by retrieving their assigned cargo and scoring
          it into the hub. Human players assist the cargo retrieval and scoring
          efforts from within their terminals. In the final moments of each
          match, alliance robots race to engage with their hangar to prepare for
          transport! Each match begins with a 15-second autonomous period,
          during which time alliance robots operate only on pre-programmed
          instructions to score points by:`,
        `<ul>
          <li>taxiing from their tarmac and</li>
          <li>retrieving and scoring their assigned cargo into the hub.</li>
        </ul>`,
        `In the final 2 minutes and 15 seconds of the match, drivers take
          control of the robots and score points by:`,
        `<ul>
          <li>
            continuing to retrieve and score their assigned cargo into the hub
            and
          </li>
          <li>engaging with their hangar.</li>
        </ul>`,
        `During this year's FIRST challenge we went to two competitions, the
          first being the Smoky Mountain Regionals where we ranked 31st out of
          43 teams and our team had made it to the semifinals. At Smoky Mountain
          Regionals we were picked to join the Alliance of the Beak Squad (4028)
          and Robotichauns (2393).`,
        `In our off season event at WVRoX, we ranked 19th out of 24 teams, and
          we made it to the quarterfinals, where we were picked by Dark Side
          Robotics (7515) and Horsepower (4991).`
      ]
    },
    {
      visible: false,
      title: '2020/21 - Plaster Blaster',
      img: 'https://i.imgur.com/Epu2wza.png',
      paragraphs: [
        `"Plaster Blaster" was named after our current mechanical mentor Jacob
          Plasters. Plaster Blaster is our tenth robot designed to play in the
          2020 INFINITE RECHARGE game. The robot had a rear intake and could
          hold three balls (power cells) and fire them out through the front.
          Plaster Blaster also had the ability to climb up on the generator
          switch.`,
        `In INFINITE RECHARGE<SUP> SM </SUP>, two alliances work to protect FIRST City from
          approaching asteroids caused by a distant space skirmish. Each
          Alliance, along with their trusty droids, race to collect and score
          Power Cells in order to energize their Shield Generator for maximum
          protection. To activate stages of the Shield Generator, droids
          manipulate their Control Panels after scoring a specific number of
          Power Cells. Near the end of the match, droids race to their
          Rendezvous Point to get their Shield Generator operational in order to
          protect the city! During the 15 second Autonomous Period, droids
          follow pre-programmed instructions.`,
        `Alliances score points by:`,
        `<ol>
          <li>Scoring Power Cells in the Power Port</li>
          <li>Moving from the Initiation Line</li>
        </ol>`,
        `In the final 2 minutes and 15 seconds of the match, drivers take
          control of the droids. Alliances score points by:`,
        `<ol>
          <li>Continue to score Power Cells in the Power Port</li>
          <li>Completing Rotation Control</li>
          <li>Completing Position Control</li>
          <li>Hanging from the Generator Switch</li>
          <li>Getting the Generator Switch to the level position</li>
        </ol>`,
        `Plaster Blaster only competed in one competition, due to COVID-19. The
          competition it competed in was the Palmetto Regional in Myrtle Beach,
          South Carolina. Our bot was ranked 22 out of 63, and were picked by
          Alliance 5 team captain AMP'D Robotics (1708) and their first pick
          Pandamaniacs (1293). Our alliance was knocked out in quarterfinals
          match number 2.`
      ]
    },
    {
      visible: false,
      title: '2019 - BeanIX',
      img: 'https://i.imgur.com/uZKqZ6L.jpeg',
      paragraphs: [
        `"Bean IX" was made our 2019 year for our FIRST competition Deep Space
          and was named because it was our teams ninth ever competition robot.
          The most important device we had on the robot was a gripper which
          allowed us during the game to pick balls and panels off the ground.`,
        `Our competition this year, DESTINATION: DEEP SPACE, where we joined
          two competing Alliances collecting samples on Planet Primus.
          Unpredictable terrain and weather patterns make remote ROBOT operation
          essential to their mission on the planet. With only 2:30 until
          liftoff, the Alliances must gather as many cargo pods as possible and
          prepare their spaceships before the next sandstorm arrives (when the
          game ends). Robots independently follow preprogrammed instructions or
          are operated by human drivers via video from their stations.`,
        `Alliances score points by`,
        `<ol style="text-align: left">
          <li>Developing robots from Habitat (HAB)</li>
          <li>Preparing rockets and the cargo ship with hatch panels</li>
          <li>
            Loading cargo pods into their rockets and cargo ship. For the first
            15 seconds, robots are programmed to do tasks autonomously, at
            T-minus 2:15, human operators take control of their robots.
          </li>
        </ol>`,
        `Alliances continue to score points by`,
        `<ol style="text-align: left">
          <li>Preparing rockets and the cargo ship with hatch panels</li>
          <li>Loading more cargo pods</li>
          <li>
            Returning the robot safely to the Alliance's Hab. The Alliance with
            the highest score at the end wins
          </li>
        </ol>`,
        `During this year's FIRST challenge we went to two competitions, our
          first being the Miami Valley Regionals. We ranked 32nd out of 60 teams
          that went, and we did not get passed to qualifiers. Then our second
          competition at the Greater Pittsburgh Regionals in California, we
          ranked 24th out of 45 teams and we also did not get passed to
          qualifiers`
      ]
    },
    {
      visible: false,
      title: '2018 - GLough',
      img: 'https://i.imgur.com/5gGK4tR.jpeg',
      paragraphs: [
        `"GLough" was named in loving memory of electrical mentor and father,
          Glenn Lough, after he passed away earlier that year. GLough is our
          eighth robot and was designed to play in the 2018 FIRST POWER UP game.
          The robot had an intake in the front to pick up cubes and place them
          in switches and scales. GLough also has an elevator that can rise up
          to double his height to place cubes. The most impressive part of
          GLough is that the elevator can lift him up in the final stage of the
          game to climb and defeat the boss.`,
        `FIRST&reg; POWER UP<SUP> SM </SUP>, the 2018 FIRST&reg; Robotics
          Competition game, includes two alliances of video game characters and
          their human operators who are trapped in an arcade game. Both
          alliances are working to defeat the boss in order to escape!`,
        `Each three-team alliance prepares to defeat the boss in three ways:`,
        `<ol style="text-align: left">
          <li>
            <strong>Control the Switches and the Scale.</strong> Robots collect
            Power Cubes and place them on Plates to control Switches or the
            Scale. When the Scale or their Switch is tipped in their favor, it
            is considered owned by that Alliance. Alliances work to have
            ownership for as much time as possible.
          </li>
          <li>
            <strong>Earn Power Ups.</strong> Robots deliver Power Cubes to their
            humans who then place them into the Vault earning the Alliance Power
            Ups. Alliances use Power Ups to gain a temporary advantage during
            the Match. There are three Power Ups available to teams: Force,
            Boost, and Levitate.
          </li>
          <ul>
            <li>
              Force gives the alliance ownership of the Switch, Scale, or both
              for a limited period of time.
            </li>
            <li>
              Boost doubles the rate points are earned for a limited period of
              time,
            </li>
            <li>Levitate gives a robot a free climb.</li>
          </ul>
          <li>
            <strong>Climb the Scale.</strong> Robots Climb the Scale in order to
            be ready to Face The Boss.
          </li>
        </ol>`,
        `GLough competed in two competitions during the regular season, the
          Miami Valley Regional in Dayton, OH and the Greater Pittsburgh
          Regional in California, PA. At the Miami Valley Regional we finished
          ranking 34 out of 61 teams. At the Greater Pittsburgh Regional we
          finished rank 4 out of 52 teams and in alliance selections ended up
          being the 3rd alliance captain. As alliance captains we chose teams
          4522 (Team SCREAM) and 48 (Team E.L.I.T.E.) for finals, but were
          eliminated in quarterfinals.`
      ]
    },
    {
      visible: false,
      title: '2017 - Beaniehemoth',
      img: 'https://i.imgur.com/419SOF0.jpeg',
      paragraphs: [
        `"Beaniehemoth", named after our team mascot "BeanieBot" and its
          violent attack on Jack Powers (our head programmer), was our seventh
          robot designed to play the 2017 game FIRST STEAMWORKS. He was designed
          with a slot in his front to accept gears and place them on pegs. On
          his back he as an arm to pick up gears from the floor, it is 3D
          printed to fit between the teeth of the gears and clamp down. Finally,
          in its center there is a spool so he can climb in the end game.
          Perhaps Beaniehemoth's most amazing feature is his 6 cim 10 wheel
          drive, making him on of he fastest robots of the season and one of the
          strongest!`,
        `FIRST&reg; STEAMWORKS, the 2017 FIRST&reg; Robotics Competition game,
          invites two adventurers’ clubs, in an era where steam power reigns, to
          prepare their airships for a long distance race.`,
        `Each three-team alliance prepares in three ways:`,
        `<ol style="text-align: left">
          <li>
            <strong>Build steam pressure.</strong> Robots collect fuel (balls) and score it in their
            boiler via high and low efficiency goals. Boilers turn fuel into
            steam pressure which is stored in the steam tank on their airship –
            but it takes more fuel in the low efficiency goal to build steam
            than the high efficiency goal.
          </li>
          <li>
            <strong>Start rotors.</strong> Robots deliver gears to pilots on
            their airship for installation. Once the gear train is complete,
            they turn the crank to start the rotor.
          </li>
          <li>
            <strong>Prepare for flight.</strong> Robots must latch on to their
            airship before launch (the end of the match) by ascending their
            ropes to signal that they’re ready for takeoff.
          </li>
        </ol>`,
        `Beaniehemoth competed in the 2017 Greater Pittsburgh Regional, in
          California, PA. There we were ranked 10 out of 39. We went on to be
          the first pick of the 6th alliance consisting of teams 4028 (The Beak
          Squad) and 4991 (Horsepower). We competed hard with them and ended as
          the regional finalists. Although we did not win the regional, our
          entire alliance was lucky enough to all receive wildcards, 2 from the
          regional winners, and 1 from the event's extra, qualifying us for the
          world championship.`,
        `At Worlds we competed in the Darwin division. We finished ranking 62 out of
          76.`
      ]
    },
    {
      visible: false,
      title: '2016 - Beanie the Barbarian',
      img: 'https://i.imgur.com/avXILvt.jpeg',
      paragraphs: [
        `"Beanie the Barbarian", named after our team mascot "BeanieBot" and
          this year's game, was our sixth robot designed to play the 2016 game
          FIRST STRONGHOLD. He was designed with a shooting mechanism in the
          center to make top goals, and an arm on the back to get trough
          defenses. It is also out first robot to use vision processing, the
          camera with the blue ring, to find goals, line up, and make a shot.`,
        `FIRST STRONGHOLD is played on a 27' x 54' field. Each alliance
          commands one tower, five defenses, and a 'secret passage' which allows
          their robots to restock on ammunition, called boulders. One defense in
          each alliance's set of five, the low bar, is a permanent part of the
          field. Three defenses are selected strategically by the alliance prior
          to the start of their match. The final defense changes periodically by
          audience selection. During the 2 minutes and 15 second match, robots
          are controlled by student drivers from behind their castle wall at the
          end of the field. Teams on an alliance work together to cross
          defenses, weaken the opposing tower by scoring boulders in it, and
          finally surround, scale and capture the tower.`,
        `Beanie the Barbarian competed in the 2016 Queen City Regional, in
          Cincinnati, OH. There we were ranked 34 out of 56. Although we did not
          get selected for an alliance, we cheered for our friends from Logan,
          WV team 337 (Hard Working Hard Hats) who played hard in their final
          matches.`,
        `In our offseason event WV ROX(West Virginia RObotics eXtreme), we
          competed with our new drive team and finished 16 out of 24. We went on
          the be on the first alliance with 456(Seige Robotics) and 2641(MARS).
          Playing hard with them, we won the event.`
      ]
    },
    {
      visible: false,
      title: '2015 - Turbo Mike',
      img: 'https://i.imgur.com/9qb4Yi4.jpeg',
      paragraphs: [
        `"Turbo Mike", named after an original team member and mentor nicked
          named as such, was our fifth robot designed to play the 2015 game
          RECYCLE RUSH. He was designed with arms and an elevator to pick up and
          stack totes. Also at Worlds we added on arms in the back of the robot
          allowing us to, as it was later nicknamed, "canburgle" cans from the
          center of the field.`,
        `RECYCLE RUSH is a recycling-themed game designed for the 2015 FIRST
          Robotics Competition (FRC). It is played by two Alliances of three
          teams each. Alliances compete simultaneously to score points by
          stacking Totes on Scoring Platforms, capping those stacks with
          Recycling Containers, and properly disposing of Litter, represented by
          pool noodles, in designated locations. The 27' x 54' ft playing Field
          is bisected by a small Step which may not be climbed on or crossed by
          Robots. Thus each Alliance competes on their respective 26' x 27' ft
          side of the Field.`,
        `Turbo Mike competed in the 2015 Smoky Mountains Regional. There we
          were ranked 22 out of 51. We went on to be selected by the 1st
          alliance consisting of teams 3824(HVA RoHAWKtics) and 2614(MARS). We
          competed through finals where we won the competition qualifying us for
          the world competition.`,
        `At Worlds we competed in the Galileo division. We finished ranking 62 out of
          76.`
      ]
    },
    {
      visible: false,
      title: '2014 - Carla',
      img: 'https://i.imgur.com/zx1KxhC.jpeg',
      paragraphs: [
        `"Carla", named after a beloved team mother who lost her battle to
          breast cancer, was our fourth robot designed to play the 2014 game
          AERIAL ASSIST. She was designed to both intake and shoot balls out of
          her large "mouth".`,
        `AERIAL ASSIST is played by two competing Alliances of three Robots
          each on a flat 25' x 54' ft field, straddled by a lighting truss
          suspended just over five feet above the floor. The objective is to
          score as many balls in goals as possible during a 2 minute and 30
          second match. The more Alliances score their ball in their goals, and
          the more they work together to do it, the more points their alliance
          receives. Alliances receive large bonuses for "assists," which are
          earned for each robot that has possession of the ball in a zone as the
          ball moves down the field.`,
        `Carla competed in the 2014 Smoky Mountains Regional. There we were
          ranked 10 out of 49. As different captains in the top 8 ranks picked
          each other we moved up to be the 8th seed. That meant that we were the
          captain of the 8th alliance. We picked teams 281(EnTech GreenVillans)
          and 342(Burning Magnetos). We played through semifinals where we were
          eliminated. Even though we did not win the regional we did win the
          Regional Engineering Inspiration Award which
          <em>"Celebrates outstanding success in advancing respect and
            appreciation for engineering within a team's school and
            community."</em>
          This qualified us for the world championship.`,
        `At Worlds we competed in the Archimedes division. We finished ranking 32 out of
          100.`
      ]
    },
    {
      visible: false,
      title: '2013 - DJ',
      img: 'https://i.imgur.com/SbktBVu.jpeg',
      paragraphs: [
        `"DJ", named after our amazing and inspiring mentor Denise Johnson who
          was retiring this year, was our third robot designed to play the 2013
          game ULTIMATE ASCENT. She was designed to take in frisbees at the top
          and shoot them out of a channel just below it. Then she could lift her
          arm up to hook onto a pyramid and pull herself an inch completely off
          of the ground (an end game challenge).`,
        `ULTIMATE ASCENT is played by two competing alliances on a flat, 27' x
          54' ft field. Each alliance consists of three robots. They compete to
          score as many discs into their goals as they can during a two
          (2)-minute and fifteen (15)-second match. The higher the goal in which
          the disc is scored, the more points the alliance receives. The match
          ends with robots attempting to climb on pyramids located near the
          middle of the field. The robot earns points based on how high it
          climbs.`,
        `DJ competed in two competitions, the 2013 Pittsburgh Regional and
          Cross Roads Regional. At Pittsburgh we were ranked 13 out of 45. We
          went on to be selected by the 6th alliance consisting of teams
          291(CIA-Creativity In Action) and 4601(Circuit Birds). We played in
          quarterfinals and were eliminated. At Cross Roads we were ranked 16
          out of 50. We went on to be selected by the 2nd alliance consisting of
          teams 930(Mukwonago BEARs) and 1501(Team THRUST). We played in
          quarterfinals and were eliminated.`
      ]
    },
    {
      visible: false,
      title: '2012 - HU',
      img: 'https://i.imgur.com/HF9COiq.jpeg',
      paragraphs: [
        `"HU", named after Winfield High School's beloved principal William
          Hughes, was our second robot designed to play the 2012 game REBOUND
          RUMBLE. He was designed with a long channel that took in balls at the
          bottom to launch them out the top. There was also an attachment on his
          back that allowed him to tilt a bridge toward him so he could balance
          it (this was an important part of the game).`,
        `REBOUND RUMBLE is played by two competing alliances on a flat, 27' x
          54' ft field. Each alliance consists of three robots. They compete to
          score as many basketballs into their hoops as they can during a 2
          minute and 15 second match. The higher the hoop in which the
          basketball is scored, the more points the alliance receives. The match
          ends with robots attempting to balance on bridges located at the
          middle of the field.`,
        `HU competed in two competitions, the 2012 Pittsburgh Regional and
          Queen City Regional. At Pittsburgh we were ranked 26 out of 45. We
          went on to be selected by the 4th alliance consisting of teams 1533
          (Triple Strange) and 3138 (Innovators Robotics). We played with them
          through semifinals where we were eliminated. At the Queen City we were
          ranked 17 out of 57. We went on to be selected by the 1st alliance
          consisting of teams 3138(Innovator Robotics) and 1730(Team Driven). We
          played with them and were eliminated in quarterfinals.`
      ]
    },
    {
      visible: false,
      title: '2011 - McCoy',
      img: 'https://i.imgur.com/nD0SAxr.jpeg',
      paragraphs: [
        `"McCoy", named in honor of one of the most respected faculty members
          at Winfield High, Coach Leon McCoy, was our first robot designed to
          play the 2011 game LOGO MOTION. He was designed as a defensive bot who
          had an attachment on the back to launch a "mini bot" up a pole, a
          crucial part of the game.`,
        `LOGO MOTION is played by two competing alliances on a flat 27' x 54'
          ft field. Each alliance consists of three robots. They compete to hang
          as many inflated plastic shapes (triangles, circles, and squares) on
          their grids as they can during a 2 minute and 15 second match. The
          higher the teams hang their game pieces on their scoring grid, the
          more points their alliance receives. The match ends with robots
          deploying minibots, small electro-mechanical assemblies that are
          independent of the host robot, onto vertical poles. The minibots race
          to the top of the pole to trigger a sensor and earn additional bonus
          points.`,
        `McCoy competed in the 2011 Pittsburgh Regional. There we were ranked
          38 out of 39 teams. We went on to be selected by the 1st alliance
          consisting of teams 1114 (Simbotics) and 1503(Spartonics). We went all
          the way through finals and won the regional, qualifying us for the
          world championship.`,
        `We competed in the World-Wide championship in St. Louis, MO. We
          finished 61 out of 88 in our division.`,
      ],
    },
  ];

  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.setScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setScreenSize();
  }

  private setScreenSize(): void {
    this.screenSize = this.gs.getScreenSize();
  }

  public setVisible(bot: Bot, bool: boolean) {
    bot.visible = bool;
  }
}

class Bot {
  visible = false;
  title = '';
  img = '';
  paragraphs: string[] = [];
}