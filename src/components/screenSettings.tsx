import { h, JSX, Fragment } from "preact";
import { IDispatch } from "../ducks/types";
import { MenuItem, MenuItemWrapper } from "./menuItem";
import { Thunk } from "../ducks/thunks";
import { MenuItemEditable } from "./menuItemEditable";
import { lb } from "lens-shmens";
import { InternalLink } from "../internalLink";
import { IUser } from "../models/user";
import { ClipboardUtils } from "../utils/clipboard";
import { Share } from "../models/share";
import { useState } from "preact/hooks";
import { ILengthUnit, ISettings, IUnit } from "../types";
import { ILoading } from "../models/state";
import { WhatsNew } from "../models/whatsnew";
import { ImporterStorage } from "./importerStorage";
import { ImporterProgram } from "./importerProgram";
import { NavbarView } from "./navbar";
import { Surface } from "./surface";
import { Footer2View } from "./footer2";
import { IScreen } from "../models/screen";
import { GroupHeader } from "./groupHeader";
import { rightFooterButtons } from "./rightFooterButtons";
import { HelpSettings } from "./help/helpSettings";
import { WebpushrButton } from "./webpushrButton";

interface IProps {
  dispatch: IDispatch;
  screenStack: IScreen[];
  user?: IUser;
  currentProgramName?: string;
  settings: ISettings;
  loading: ILoading;
}

export function ScreenSettings(props: IProps): JSX.Element {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <Surface
      navbar={
        <NavbarView
          loading={props.loading}
          dispatch={props.dispatch}
          helpContent={<HelpSettings />}
          screenStack={props.screenStack}
          title="Settings"
        />
      }
      footer={
        <Footer2View
          dispatch={props.dispatch}
          rightButtons={rightFooterButtons({ dispatch: props.dispatch, active: "settings" })}
        />
      }
    >
      <section className="px-4">
        <MenuItem
          shouldShowRightArrow={true}
          name="Program"
          value={props.currentProgramName}
          onClick={() => {
            props.dispatch({ type: "PushScreen", screen: "programs" });
          }}
        />
        <GroupHeader name="Account" topPadding={true} />
        <MenuItem
          name="Account"
          value={props.user?.email}
          shouldShowRightArrow={true}
          onClick={() => props.dispatch(Thunk.pushScreen("account"))}
        />
        {props.user && (
          <MenuItemEditable
            type="text"
            name="Nickname"
            value={props.settings.nickname || ""}
            nextLine={<div className="text-xs text-grayv2-main">Used for profile page</div>}
            onChange={(newValue) => {
              props.dispatch({
                type: "UpdateSettings",
                lensRecording: lb<ISettings>()
                  .p("nickname")
                  .record(newValue ? newValue : undefined),
              });
            }}
          />
        )}
        {props.user && (
          <MenuItemEditable
            type="boolean"
            name="Is Profile Page Public?"
            value={props.settings.isPublicProfile ? "true" : "false"}
            nextLine={
              props.user?.id && props.settings.isPublicProfile ? (
                <div>
                  <div className="flex">
                    <button
                      className="mr-auto text-xs text-left text-blue-700 underline"
                      onClick={() => {
                        const text = Share.generateProfileLink(props.user!.id);
                        if (text != null) {
                          ClipboardUtils.copy(text);
                          setIsCopied(true);
                        }
                      }}
                    >
                      Copy Link To Clipboard
                    </button>
                    <InternalLink
                      href={`/profile/${props.user.id}`}
                      className="ml-4 text-xs text-right text-blue-700 underline"
                    >
                      Open Public Profile Page
                    </InternalLink>
                  </div>
                  {isCopied && <div className="text-xs italic text-green-600">Copied!</div>}
                </div>
              ) : undefined
            }
            onChange={(newValue) => {
              if (props.user != null) {
                props.dispatch({
                  type: "UpdateSettings",
                  lensRecording: lb<ISettings>()
                    .p("isPublicProfile")
                    .record(newValue === "true"),
                });
              } else {
                alert("You should be logged in to enable public profile");
              }
            }}
          />
        )}

        <GroupHeader name="Workout" topPadding={true} />
        <MenuItem
          name="Timers"
          onClick={() => props.dispatch(Thunk.pushScreen("timers"))}
          shouldShowRightArrow={true}
        />
        <MenuItem
          shouldShowRightArrow={true}
          name="Available Equipment"
          onClick={() => props.dispatch(Thunk.pushScreen("plates"))}
        />
        <MenuItemEditable
          type="select"
          name="Weight Units"
          value={props.settings.units}
          values={[
            ["kg", "kg"],
            ["lb", "lb"],
          ]}
          onChange={(newValue) => {
            props.dispatch({
              type: "UpdateSettings",
              lensRecording: lb<ISettings>()
                .p("units")
                .record(newValue as IUnit),
            });
          }}
        />
        <MenuItemEditable
          type="select"
          name="Length Units"
          value={props.settings.lengthUnits}
          values={[
            ["cm", "cm"],
            ["in", "in"],
          ]}
          onChange={(newValue) => {
            props.dispatch({
              type: "UpdateSettings",
              lensRecording: lb<ISettings>()
                .p("lengthUnits")
                .record(newValue as ILengthUnit),
            });
          }}
        />
        <WebpushrButton />
        {props.user && Features.areFriendsEnabled() && (
          <>
            <GroupHeader topPadding={true} name="Friends" />
            <MenuItem
              shouldShowRightArrow={true}
              name="Friends"
              onClick={() => {
                props.dispatch({ type: "PushScreen", screen: "friends" });
              }}
            />
            <MenuItemEditable
              type="select"
              name="Show friends history?"
              value={props.settings.shouldShowFriendsHistory ? "true" : "false"}
              values={[
                ["true", "Yes"],
                ["false", "No"],
              ]}
              onChange={(newValue) => {
                props.dispatch({
                  type: "UpdateSettings",
                  lensRecording: lb<ISettings>()
                    .p("shouldShowFriendsHistory")
                    .record(newValue === "true"),
                });
              }}
            />
          </>
        )}
        <GroupHeader name="Import / Export" topPadding={true} />
        <div className="ls-export-data">
          <MenuItemWrapper name="Export data to JSON file" onClick={() => props.dispatch(Thunk.exportStorage())}>
            <button className="py-3">Export data to JSON file</button>
          </MenuItemWrapper>
        </div>
        <div className="ls-export-history">
          <MenuItemWrapper name="Export history to CSV file" onClick={() => props.dispatch(Thunk.exportHistoryToCSV())}>
            <button className="py-3">Export history to CSV file</button>
          </MenuItemWrapper>
        </div>
        <div className="ls-import-data">
          <ImporterStorage dispatch={props.dispatch} />
        </div>
        <div className="ls-import-program">
          <ImporterProgram dispatch={props.dispatch} />
        </div>

        <GroupHeader name="Miscellaneous" topPadding={true} />
        <div className="ls-changelog">
          <MenuItem name="Changelog" onClick={() => WhatsNew.showWhatsNew(props.dispatch)} />
        </div>
        <a href="mailto:info@liftosaur.com" className="block py-3 text-base text-left border-b border-gray-200">
          Contact Us
        </a>
        <InternalLink href="/privacy.html" className="block py-3 text-base text-left border-b border-gray-200">
          Privacy Policy
        </InternalLink>
        <InternalLink href="/terms.html" className="block py-3 text-base text-left border-b border-gray-200">
          Terms &amp; Conditions
        </InternalLink>
        <InternalLink href="/licenses.html" className="block py-3 text-base text-left border-b border-gray-200">
          Licenses
        </InternalLink>
        <InternalLink href="/docs/docs.html" className="block py-3 text-base text-left border-b border-gray-200">
          Documentation
        </InternalLink>
        <a
          href="https://github.com/astashov/liftosaur"
          className="block py-3 text-base text-left border-b border-gray-200"
        >
          Source Code on Github
        </a>
      </section>
    </Surface>
  );
}
