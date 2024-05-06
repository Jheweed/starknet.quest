"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@styles/questboost.module.css";
import BoostCard from "@components/quest-boost/boostCard";
import CategoryTitle from "@components/UI/titles/categoryTitle";
import Componentstyles from "@styles/components/pages/home/howToParticipate.module.css";
import Steps from "@components/UI/steps/steps";
import { getBoosts, getCompletedQuests } from "@services/apiService";
import BackButton from "@components/UI/backButton";
import { useRouter } from "next/navigation";
import { useAccount } from "@starknet-react/core";
import { CompletedQuests, QueryError } from "types/backTypes";
import FeaturedQuestSkeleton from "@components/skeletons/questsSkeleton";
import { MILLISECONDS_PER_WEEK } from "@constants/common";

export default function Page() {
  const router = useRouter();
  const { address } = useAccount();

  const [boosts, setBoosts] = useState<Boost[]>([]);
  const [completedQuests, setCompletedQuests] = useState<
    CompletedQuests | QueryError
  >([]);
  const [loadingBoosts, setLoadingBoosts] = useState<boolean>(true);
  const [loadingCompletedQuests, setLoadingCompletedQuests] =
    useState<boolean>(true);

  useEffect(() => {
    const fetchBoosts = async () => {
      try {
        const res = await getBoosts();
        if (res) setBoosts(res);
      } catch (err) {
        console.log("Error while fetching boosts", err);
      } finally {
        setLoadingBoosts(false);
      }
    };

    fetchBoosts();
  }, []);

  useEffect(() => {
    const fetchCompletedQuests = async () => {
      if (!address) return;

      try {
        const res = await getCompletedQuests(address);
        setCompletedQuests(res);
      } catch (err) {
        console.log("Error while fetching completed quests", err);
      } finally {
        setLoadingCompletedQuests(false);
      }
    };

    fetchCompletedQuests();
  }, [address]);

  const filteredBoosts = useMemo(() => {
    return boosts?.filter(
      (boost) =>
        (new Date().getTime() - boost.expiry) / MILLISECONDS_PER_WEEK <= 3
    );
  }, [boosts]);

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <BackButton onClick={() => router.back()} />
      </div>
      <h1 className={styles.title}>Boosts Quest</h1>

      {!loadingBoosts && !loadingCompletedQuests ? (
        <div className={styles.card_container}>
          {filteredBoosts.length > 0 ? (
            filteredBoosts?.map((boost) => {
              return (
                <BoostCard
                  key={boost.id}
                  boost={boost}
                  completedQuests={completedQuests}
                />
              );
            })
          ) : (
            <h2 className={styles.noBoosts}>
              No quests are being boosted at the moment.
            </h2>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center w-full">
          <FeaturedQuestSkeleton />
        </div>
      )}

      <section className={styles.instructions_container}>
        <CategoryTitle
          title="How Quest Boosts and the Lottery Work ?"
          subtitle="Boost Your Quests, Maximize Your Gains!"
        />
        <div className={Componentstyles.stepsContainer}>
          <Steps
            subTitleBefore={true}
            steps={[
              {
                title: "Complete Boosted Quests & Earn tokens",
                subtitle: "01",
                description:
                  "When a quest is boosted, every completion automatically gives you a chance in our lottery to earn tokens. The more boosted quests you complete, the higher your chances of winning are!",
                icon: "/icons/starknet.svg",
                banner: "/visuals/boost/rocket.webp",
              },
              {
                title: "Claim Your Piece of the Pie",
                subtitle: "02",
                description:
                  "Once the quest is finished, check the quest's special page to see if you've won the lottery. If you have, claim your reward with just one click!",
                icon: "/icons/crown.svg",
                banner: "/visuals/boost/coins.webp",
              },
              {
                title: "Increase Your Chances",
                subtitle: "03",
                description:
                  "You're not limited to just one boost. If you complete several boosted quests, you multiply your chances in the lottery. Be adventurous and maximize your gains!",
                icon: "/icons/verified.svg",
                banner: "/visuals/boost/leaf.webp",
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
