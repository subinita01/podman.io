import React, { useRef } from 'react';
import CustomCard from '@site/src/components/ui/CustomCard';
import SubcardGrid from '@site/src/components/layout/SubcardGrid';
import SectionHeader from '@site/src/components/layout/SectionHeader';
import Dropdown from '@site/src/components/utilities/DropDown';
import * as markDownFiles from '@site/static/data/meetings/notes/index'; // ToDo: Lazy load these files

type CommunityMeetingsCardProps = {
  title: string;
  subtitle: string;
  date: string;
  timeZone: string;
  buttons: [
    {
      text: string;
      path: string;
    },
  ];
};

type DropdownOptionProps = {
  date: string;
  meeting_recording: {
    text: string;
    link: string;
  };
  meeting_minutes: {
    text: string;
    path: string;
  };
};

type SubcardButtonProps = {
  text: string;
  path?: string;
};

type SubcardGridProps = {
  buttons: SubcardButtonProps[];
  icon: string;
  date: string;
};

/**
 * The note modules are exported as `F<YYYYMMDD>`, matching the
 * `static/data/meetings/notes/<YYYY-MM-DD>` directory they are loaded from.
 */
function meetingPath(moduleName: string): string | undefined {
  const match = /^F(\d{4})(\d{2})(\d{2})$/.exec(moduleName);
  return match ? `/community/meetings/${match[1]}-${match[2]}-${match[3]}` : undefined;
}

function CommunityMeetingsCardGrid({ cards }) {
  let cabalDropdownOptions: DropdownOptionProps[] = [];
  let MeetingDropdownOptions: DropdownOptionProps[] = [];

  const meetingMinutesRef = [useRef(), useRef()];

  const populateMeetings = (): void => {
    Object.entries(markDownFiles)?.forEach(([moduleName, mdFile]) => {
      const path = meetingPath(moduleName);
      if (!path) {
        return;
      }
      let mdReader = mdFile?.default(useRef());
      mdReader?.props?.children?.forEach(child => {
        let field1: string = child?.props?.children?.[0];
        let field2: { props?: { href?: string } } = child?.props?.children?.[1];
        if (typeof field1 == 'string' && (field1.includes('BlueJeans') || field1.includes('Video'))) {
          const option: DropdownOptionProps = {
            date: (mdFile?.toc?.[0]?.value as string).split(/[0-9]{2}:[0-9]{2}/)[0],
            meeting_minutes: {
              path,
              text: 'Meeting Minutes',
            },
            meeting_recording: {
              link: field2?.props?.href,
              text: 'Watch Recording',
            },
          };
          if (mdFile?.contentTitle?.includes('Cabal')) {
            cabalDropdownOptions.unshift(option);
          } else {
            MeetingDropdownOptions.unshift(option);
          }
        }
      });
    });
  };

  function DropDownOption(props: DropdownOptionProps) {
    const { meeting_minutes, meeting_recording, date } = props;

    return (
      <div className="inline-flex justify-around bg-white px-8 py-1 dark:bg-gray-700 dark:shadow-none">
        <h3 className="flex-1 pl-1 text-base text-gray-700 dark:text-gray-50">{date}</h3>
        <a className="flex-1 no-underline hover:no-underline" href={meeting_recording?.link}>
          {meeting_recording?.text}
        </a>
        <a href={meeting_minutes?.path}>{meeting_minutes?.text}</a>
      </div>
    );
  }

  function getDropdownOption(options: DropdownOptionProps[]) {
    return options.map(option => <DropDownOption key={option.meeting_minutes.path} {...option} />);
  }

  populateMeetings();

  let communityMeetingsData: SubcardGridProps[] = [];
  let CabalMeetingsData: SubcardGridProps[] = [];

  // get top 2 CommunityMeetings & CabalMeetings for subcards
  for (let i = 0; i < 2; i++) {
    let meeting = MeetingDropdownOptions.shift();
    communityMeetingsData.push({
      date: meeting?.date,
      icon: 'film-icon',
      buttons: [
        {
          path: meeting?.meeting_recording?.link,
          text: meeting?.meeting_recording?.text,
        },
        { ...meeting?.meeting_minutes },
      ],
    });
    meeting = cabalDropdownOptions.shift();
    CabalMeetingsData.push({
      date: meeting?.date,
      icon: 'film-icon',
      buttons: [
        {
          path: meeting?.meeting_recording?.link,
          text: meeting?.meeting_recording?.text,
        },
        { ...meeting?.meeting_minutes },
      ],
    });
  }

  return (
    <div className="justify-content-center align-items-center custom-card-grid-root flex">
      {cards.map((card: CommunityMeetingsCardProps, index: number) => {
        let meetingsData = index == 1 ? CabalMeetingsData : communityMeetingsData;
        return (
          <div
            key={`card-container-${index}`}
            className="align-items-center card-container mb-4 flex flex-1 flex-col flex-wrap justify-center transition duration-150 ease-linear lg:mb-6">
            <CustomCard
              key={`custom-card-${index}`}
              title={card?.title}
              subtitle={card?.date}
              details={card?.timeZone}
              text={card?.subtitle}
              data={card?.buttons}
              primary={true}
            />
            <SectionHeader
              title=""
              description="Most Recent meetings"
              textGradientStops="from-purple-500 to-purple-700 dark:text-purple-500"
              textGradient={false}
            />
            <SubcardGrid key={`subcard-grid-${index}`} cards={meetingsData} />
            <Dropdown
              options={getDropdownOption(index == 1 ? [...cabalDropdownOptions] : [...MeetingDropdownOptions])}
              dropdownRef={meetingMinutesRef[index]}
              text="Older meeting details"
            />
          </div>
        );
      })}
    </div>
  );
}

export default CommunityMeetingsCardGrid;
